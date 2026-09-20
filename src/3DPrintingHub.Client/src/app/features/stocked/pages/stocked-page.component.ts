import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ProductStockRepository } from '../../../data/repositories/product-stock.repository';
import { ModelRepository } from '../../../data/repositories/model.repository';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { ModelPrint } from '../../../domain/models/model-print.model';
import { Filament } from '../../../domain/models/filament.model';
import { ProductStock, ProductStockCreate } from '../../../domain/models/product-stock.model';
import { ConfirmDeleteComponent } from '../../../shared/ui/confirm-delete/confirm-delete.component';
import { TableCellDirective, TableColumn, TableComponent } from '../../../shared/ui/table/table.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { StockFormModalComponent, StockFormValue } from '../components/stock-form-modal/stock-form-modal.component';

@Component({
  selector: 'app-stocked-page',
  standalone: true,
  imports: [CommonModule, TableComponent, TableCellDirective, ConfirmDeleteComponent, DateFormatPipe, StockFormModalComponent],
  templateUrl: './stocked-page.component.html',
  styleUrls: ['./stocked-page.component.css']
})
export class StockedPageComponent implements OnInit {
  private productStockRepository = inject(ProductStockRepository);
  private modelRepository = inject(ModelRepository);
  private filamentRepository = inject(FilamentRepository);

  protected readonly title = signal('Stock');

  protected readonly columns: TableColumn<ProductStock>[] = [
    { key: 'id', header: 'ID', value: stock => stock.id },
    { key: 'modelPrintName', header: 'Model', value: stock => stock.modelPrintName },
    { key: 'filamentColorName', header: 'Filament', value: stock => stock.filamentColorName },
    { key: 'quantity', header: 'Quantity' },
    { key: 'costToProduce', header: 'Cost To Produce', value: stock => stock.costToProduce },
    { key: 'recommendedSalePrice', header: 'Recommended Sale Price', value: stock => stock.recommendedSalePrice },
    { key: 'salePrice', header: 'Sale Price', value: stock => stock.salePrice },
    { key: 'lastUpdated', header: 'Last Updated', value: stock => stock.lastUpdated }
  ];

  // Create / edit modal state
  protected open = signal(false);
  protected loading = signal(false);
  protected editingStock = signal<ProductStock | null>(null);

  // Reference data for the dropdowns
  protected models = signal<ModelPrint[]>([]);
  protected filaments = signal<Filament[]>([]);

  // Existing stock list
  protected productStocks = signal<ProductStock[]>([]);
  protected productStocksLoading = signal(false);

  // Generic delete confirmation state (shared by the product stock table)
  protected deleteOpen = signal(false);
  protected deleteLoading = signal(false);
  protected deleteName = signal('');
  private pendingDelete: (() => Promise<void>) | null = null;

  protected openDeleteConfirm(name: string, action: () => Promise<void>): void {
    this.deleteName.set(name);
    this.pendingDelete = action;
    this.deleteOpen.set(true);
  }

  protected closeDeleteModal(): void {
    this.deleteOpen.set(false);
    this.deleteName.set('');
    this.pendingDelete = null;
  }

  protected async confirmDelete(): Promise<void> {
    const action = this.pendingDelete;
    this.pendingDelete = null;
    if (!action) {
      this.closeDeleteModal();
      return;
    }
    this.deleteLoading.set(true);
    try {
      await action();
      this.closeDeleteModal();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert(`Error: ${error}`);
    } finally {
      this.deleteLoading.set(false);
    }
  }

  // Per-row quantity adjustment state
  protected adjustInputs = signal<Record<string, number>>({});
  protected adjustingId = signal<string>('');

  protected getAdjustInput(id: string): number {
    return this.adjustInputs()[id] ?? 0;
  }

  protected setAdjustInput(id: string, value: string): void {
    this.adjustInputs.update(inputs => ({ ...inputs, [id]: value ? +value : 0 }));
  }

  protected async adjustQuantity(stock: ProductStock, action: 'add' | 'subtract'): Promise<void> {
    const amount = this.getAdjustInput(stock.id);
    if (amount <= 0) {
      alert('Please enter a valid quantity greater than 0.');
      return;
    }

    this.adjustingId.set(stock.id);
    try {
      await firstValueFrom(this.productStockRepository.adjustProductStockQuantity({
        productStockId: stock.id,
        quantity: action === 'add' ? amount : -amount
      }));
      await this.loadProductStocks();
      this.setAdjustInput(stock.id, '');
    } catch (error) {
      console.error(`Error ${action === 'add' ? 'adding' : 'reducing'} quantity:`, error);
      alert(`Error: ${error}`);
    } finally {
      this.adjustingId.set('');
    }
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadModels(),
      this.loadFilaments(),
      this.loadProductStocks()
    ]);
  }

  protected openCreateModal(): void {
    this.editingStock.set(null);
    this.open.set(true);
  }

  protected closeStockModal(): void {
    this.open.set(false);
    this.editingStock.set(null);
  }

  protected openEditStock(stock: ProductStock): void {
    this.editingStock.set(stock);
    this.open.set(true);
  }

  protected async saveStock(value: StockFormValue): Promise<void> {
    const payload: ProductStockCreate = {
      modelPrintId: value.modelPrintId,
      filamentId: value.filamentId,
      quantityInStock: value.quantityInStock,
      salePrice: value.salePrice
    };

    if (!payload.modelPrintId || !payload.filamentId) {
      alert('Please select a model and a filament.');
      return;
    }

    this.loading.set(true);
    try {
      const editing = this.editingStock();
      if (editing) {
        await firstValueFrom(this.productStockRepository.updateProductStock({ id: editing.id, ...payload }));
      } else {
        await firstValueFrom(this.productStockRepository.createProductStock(payload));
      }
      this.closeStockModal();
      await this.loadProductStocks();
      alert(editing ? 'Product stock updated successfully!' : 'Product stock created successfully!');
    } catch (error) {
      console.error('Error saving product stock:', error);
      alert(`Error: ${error}`);
    } finally {
      this.loading.set(false);
    }
  }

  protected deleteStockConfirm(stock: ProductStock): void {
    this.openDeleteConfirm(`${stock.modelPrintName} / ${stock.filamentColorName}`, async () => {
      await firstValueFrom(this.productStockRepository.deleteProductStock(stock.id));
      await this.loadProductStocks();
    });
  }

  private async loadModels(): Promise<void> {
    try {
      this.models.set(await firstValueFrom(this.modelRepository.getAllModelPrints()));
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }

  private async loadFilaments(): Promise<void> {
    try {
      this.filaments.set(await firstValueFrom(this.filamentRepository.getFilaments()));
    } catch (error) {
      console.error('Error loading filaments:', error);
    }
  }

  private async loadProductStocks(): Promise<void> {
    this.productStocksLoading.set(true);
    try {
      this.productStocks.set(await firstValueFrom(this.productStockRepository.getAllProductStocks()));
    } catch (error) {
      console.error('Error loading product stocks:', error);
    } finally {
      this.productStocksLoading.set(false);
    }
  }
}
