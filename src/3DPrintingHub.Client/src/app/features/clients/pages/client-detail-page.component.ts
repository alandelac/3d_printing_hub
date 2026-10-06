import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClientRepository } from '../../../data/repositories/client.repository';
import { SaleRepository } from '../../../data/repositories/sale.repository';
import { Client } from '../../../domain/models/client.model';
import { Sale, SaleUpdate } from '../../../domain/models/sale.model';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { TableCellDirective, TableColumn, TableComponent } from '../../../shared/ui/table/table.component';

@Component({
  selector: 'app-client-detail-page',
  standalone: true,
  imports: [CommonModule, TableComponent, TableCellDirective, DateFormatPipe],
  templateUrl: './client-detail-page.component.html',
})
export class ClientDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clientRepository = inject(ClientRepository);
  private readonly saleRepository = inject(SaleRepository);

  protected readonly client = signal<Client | null>(null);
  protected readonly sales = signal<Sale[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly clientSales = computed(() => {
    const currentClient = this.client();
    if (!currentClient) {
      return [] as Sale[];
    }

    return this.sales().filter(sale => sale.clientId === currentClient.id);
  });

  protected readonly outstandingBalance = computed(() =>
    this.clientSales()
      .filter(sale => !sale.paymentReceived)
      .reduce((total, sale) => total + sale.quantity * sale.salePrice, 0)
  );

  protected readonly columns: TableColumn<Sale>[] = [
    { key: 'soldAtUtc', header: 'Date', value: sale => sale.soldAtUtc },
    { key: 'quantity', header: 'Quantity', value: sale => sale.quantity },
    { key: 'salePrice', header: 'Unit Price', value: sale => sale.salePrice },
    { key: 'paymentReceived', header: 'Paid', value: sale => sale.paymentReceived ? 'Yes' : 'No' },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false }
  ];

  async ngOnInit(): Promise<void> {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (!clientId) {
      this.error.set('Client not found.');
      return;
    }

    this.loading.set(true);
    try {
      const [client, sales] = await Promise.all([
        firstValueFrom(this.clientRepository.getClient(clientId)),
        firstValueFrom(this.saleRepository.getSales())
      ]);

      this.client.set(client);
      this.sales.set(sales);
      this.error.set(null);
    } catch (error) {
      console.error('Error loading client detail:', error);
      this.error.set(`Error: ${error}`);
    } finally {
      this.loading.set(false);
    }
  }

  protected async markPaid(sale: Sale): Promise<void> {
    if (sale.paymentReceived) {
      return;
    }

    try {
      await firstValueFrom(this.saleRepository.updateSale({
        ...sale,
        paymentReceived: true,
      } as SaleUpdate));

      const currentSales = this.sales().map(current =>
        current.id === sale.id ? { ...current, paymentReceived: true } : current
      );
      this.sales.set(currentSales);
    } catch (error) {
      console.error('Error updating payment status:', error);
      this.error.set(`Error: ${error}`);
    }
  }
}
