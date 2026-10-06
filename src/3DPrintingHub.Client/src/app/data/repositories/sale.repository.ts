import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../core/http/api-client';
import { Sale, SaleCreate, SaleUpdate } from '../../domain/models/sale.model';

@Injectable({ providedIn: 'root' })
export class SaleRepository {
  private readonly api = inject(ApiClient);

  getSales() {
    return this.api.get<Sale[]>('/sales');
  }

  getSale(id: string) {
    return this.api.get<Sale>(`/sales/${id}`);
  }

  createSale(payload: SaleCreate) {
    return this.api.post<{ id: string }>('/sales', payload);
  }

  updateSale(payload: SaleUpdate) {
    return this.api.put<Sale>(`/sales/${payload.id}`, payload);
  }
}
