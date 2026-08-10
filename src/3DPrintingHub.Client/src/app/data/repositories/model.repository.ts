import { Injectable } from '@angular/core';
import { ApiClient } from '../../core/http/api-client';
import { ModelPrintCategory } from '../../domain/models/model-print-category.model';

@Injectable({ providedIn: 'root' })
export class ModelRepository {
  constructor(private api: ApiClient) {}

  getCategories() {
    return this.api.get<ModelPrintCategory[]>('/modelprintcategories');
  }

  createCategory(payload: { name: string }) {
    return this.api.post<{ id: string }>('/modelprintcategories', payload);
  }
}
