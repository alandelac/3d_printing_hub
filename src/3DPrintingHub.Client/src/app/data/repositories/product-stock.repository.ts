import { Injectable } from '@angular/core';
import { ApiClient } from '../../core/http/api-client';
import { ProductStock, ProductStockCreate } from '../../domain/models/product-stock.model';

@Injectable({ providedIn: 'root' })
export class ProductStockRepository {
  constructor(private api: ApiClient) {}

  getAllProductStocks() {
    return this.api.get<ProductStock[]>('/productstock');
  }

  createProductStock(payload: ProductStockCreate) {
    return this.api.post<{ id: string }>('/productstock', payload);
  }

  adjustProductStockQuantity(payload: { productStockId: string; quantity: number }) {
    return this.api.put<ProductStock>(`/productstock/${payload.productStockId}/adjust-quantity`, payload);
  }
}
