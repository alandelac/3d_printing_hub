import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ProductStockRepository } from '../../../data/repositories/product-stock.repository';
import { ModelRepository } from '../../../data/repositories/model.repository';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { ModelPrint } from '../../../domain/models/model-print.model';
import { Filament } from '../../../domain/models/filament.model';
import { ProductStock, ProductStockCreate } from '../../../domain/models/product-stock.model';
import { TableActionsComponent } from '../../../shared/ui/table-actions/table-actions.component';
import { ConfirmDeleteComponent } from '../../../shared/ui/confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-stocked-page',
  standalone: true,
  imports: [CommonModule, TableActionsComponent, ConfirmDeleteComponent],
  templateUrl: './stocked-page.component.html',
  styleUrls: ['./stocked-page.component.css']
})
export class StockedPageComponent implements OnInit {
  private productStockRepository = inject(ProductStockRepository);
  private modelRepository = inject(ModelRepository);
  private filamentRepository = inject(FilamentRepository);

  protected readonly title = signal('Stock');

  // Create modal state
  protected open = signal(false);
  protected loading = signal(false);
  protected form = signal<ProductStockCreate>({
    modelPrintId: '',
    filamentId: '',
    quantityInStock: 0,
    salePrice: 0
  });

  // Reference data for the dropdowns
  protected models = signal<ModelPrint[]>([]);
  protected filaments = signal<Filament[]>([]);

  // Edit mode for the create modal
  protected editingStockId = signal('');

  protected isEditingStock(): boolean {
    return this.editingStockId() !== '';
  }

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

  protected toggleOpen(): void {
    if (!this.open()) {
      this.resetForm();
    }
    this.open.set(!this.open());
    if (!this.open()) {
      this.editingStockId.set('');
    }
  }

  protected onFormChange(field: keyof ProductStockCreate, value: string | number): void {
    this.form.update(form => ({ ...form, [field]: value }));
  }

  protected openEditStock(stock: ProductStock): void {
    this.editingStockId.set(stock.id);
    this.form.set({
      modelPrintId: stock.modelPrintId,
      filamentId: stock.filamentId,
      quantityInStock: stock.quantityInStock,
      salePrice: stock.salePrice
    });
    this.open.set(true);
  }

  protected cancelEditStock(): void {
    this.editingStockId.set('');
    this.resetForm();
    this.open.set(false);
  }

  protected async createProductStock(): Promise<void> {
    const payload = this.form();
    if (!payload.modelPrintId || !payload.filamentId) {
      alert('Please select a model and a filament.');
      return;
    }

    this.loading.set(true);
    try {
      const editingId = this.editingStockId();
      if (editingId) {
        await firstValueFrom(this.productStockRepository.updateProductStock({ id: editingId, ...payload }));
      } else {
        await firstValueFrom(this.productStockRepository.createProductStock(payload));
      }
      this.toggleOpen();
      this.editingStockId.set('');
      await this.loadProductStocks();
      alert(editingId ? 'Product stock updated successfully!' : 'Product stock created successfully!');
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

  private resetForm(): void {
    this.form.set({
      modelPrintId: this.models().length ? this.models()[0].id : '',
      filamentId: this.filaments().length ? this.filaments()[0].id : '',
      quantityInStock: 0,
      salePrice: 0
    });
    this.editingStockId.set('');
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
