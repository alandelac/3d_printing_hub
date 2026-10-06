import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ClientRepository } from '../../../data/repositories/client.repository';
import { ProductStockRepository } from '../../../data/repositories/product-stock.repository';
import { SaleRepository } from '../../../data/repositories/sale.repository';
import { Client } from '../../../domain/models/client.model';
import { ProductStock } from '../../../domain/models/product-stock.model';
import { Sale, SaleCreate, SaleUpdate } from '../../../domain/models/sale.model';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { TableCellDirective, TableColumn, TableComponent } from '../../../shared/ui/table/table.component';
import { SaleFormModalComponent, SaleFormValue } from '../components/sale-form-modal/sale-form-modal.component';

@Component({
  selector: 'app-sales-page',
  standalone: true,
  imports: [CommonModule, TableComponent, TableCellDirective, DateFormatPipe, SaleFormModalComponent],
  templateUrl: './sales-page.component.html',
})
export class SalesPageComponent implements OnInit {
  private readonly saleRepository = inject(SaleRepository);
  private readonly clientRepository = inject(ClientRepository);
  private readonly productStockRepository = inject(ProductStockRepository);

  protected readonly title = signal('Sales');
  protected readonly sales = signal<Sale[]>([]);
  protected readonly salesLoading = signal(false);
  protected readonly clients = signal<Client[]>([]);
  protected readonly productStocks = signal<ProductStock[]>([]);
  protected readonly formOpen = signal(false);
  protected readonly editingSale = signal<Sale | null>(null);
  protected readonly loading = signal(false);
  protected readonly validationError = signal<string | null>(null);

  protected readonly columns: TableColumn<Sale>[] = [
    { key: 'clientName', header: 'Client', value: sale => sale.clientName ?? 'No client' },
    { key: 'quantity', header: 'Quantity', value: sale => sale.quantity },
    { key: 'unitTotal', header: 'Total', value: sale => sale.quantity * sale.salePrice },
    { key: 'paymentReceived', header: 'Paid', value: sale => sale.paymentReceived ? 'Yes' : 'No' },
    { key: 'soldAtUtc', header: 'Date', value: sale => sale.soldAtUtc },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false }
  ];

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadClients(),
      this.loadProductStocks(),
      this.loadSales()
    ]);
  }

  protected openCreateModal(): void {
    this.editingSale.set(null);
    this.validationError.set(null);
    this.formOpen.set(true);
  }

  protected closeModal(): void {
    this.formOpen.set(false);
    this.editingSale.set(null);
    this.validationError.set(null);
  }

  protected openEditSale(sale: Sale): void {
    this.editingSale.set(sale);
    this.validationError.set(null);
    this.formOpen.set(true);
  }

  protected async markPaid(sale: Sale): Promise<void> {
    if (sale.paymentReceived) {
      return;
    }

    const updatePayload: SaleUpdate = {
      ...sale,
      paymentReceived: true,
    };

    this.loading.set(true);
    try {
      await firstValueFrom(this.saleRepository.updateSale(updatePayload));
      await this.loadSales();
      this.validationError.set(null);
    } catch (error) {
      console.error('Error marking sale as paid:', error);
      this.validationError.set(`Error: ${error}`);
      alert(`Error: ${error}`);
    } finally {
      this.loading.set(false);
    }
  }

  protected async saveSale(value: SaleFormValue): Promise<void> {
    if (!value.productStockId) {
      this.validationError.set('Please select a product stock.');
      return;
    }

    if (!Number.isFinite(value.quantity) || value.quantity <= 0) {
      this.validationError.set('Quantity must be greater than zero.');
      return;
    }

    if (!Number.isFinite(value.salePrice) || value.salePrice <= 0) {
      this.validationError.set('Unit sale price must be greater than zero.');
      return;
    }

    const payload: SaleCreate = {
      productStockId: value.productStockId,
      clientId: value.clientId || null,
      quantity: value.quantity,
      salePrice: value.salePrice,
      paymentReceived: value.paymentReceived,
    };

    this.loading.set(true);
    this.validationError.set(null);

    try {
      const editingSale = this.editingSale();
      if (editingSale) {
        await firstValueFrom(this.saleRepository.updateSale({
          ...editingSale,
          ...payload,
          id: editingSale.id,
        }));
      } else {
        await firstValueFrom(this.saleRepository.createSale(payload));
      }

      this.closeModal();
      await this.loadSales();
    } catch (error) {
      console.error('Error saving sale:', error);
      this.validationError.set(`Error: ${error}`);
      alert(`Error: ${error}`);
    } finally {
      this.loading.set(false);
    }
  }

  protected async loadSales(): Promise<void> {
    this.salesLoading.set(true);
    try {
      const [sales, clients, productStocks] = await Promise.all([
        firstValueFrom(this.saleRepository.getSales()),
        firstValueFrom(this.clientRepository.getClients()),
        firstValueFrom(this.productStockRepository.getAllProductStocks())
      ]);

      this.sales.set(sales.map(sale => ({
        ...sale,
        clientName: sale.clientName ?? clients.find(client => client.id === sale.clientId)?.name ?? 'No client'
      })));
      this.clients.set(clients);
      this.productStocks.set(productStocks);
      this.validationError.set(null);
    } catch (error) {
      console.error('Error loading sales:', error);
      alert(`Error: ${error}`);
    } finally {
      this.salesLoading.set(false);
    }
  }

  private async loadClients(): Promise<void> {
    try {
      this.clients.set(await firstValueFrom(this.clientRepository.getClients()));
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  private async loadProductStocks(): Promise<void> {
    try {
      this.productStocks.set(await firstValueFrom(this.productStockRepository.getAllProductStocks()));
    } catch (error) {
      console.error('Error loading product stocks:', error);
    }
  }
}
