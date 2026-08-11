import { Injectable } from '@angular/core';
import { ApiClient } from '../../core/http/api-client';
import { ModelPrintCategory } from '../../domain/models/model-print-category.model';
import { ModelPrint, ModelPrintCreate } from '../../domain/models/model-print.model';

@Injectable({ providedIn: 'root' })
export class ModelRepository {
  constructor(private api: ApiClient) {}

  getCategories() {
    return this.api.get<ModelPrintCategory[]>('/modelprintcategories');
  }

  createCategory(payload: { name: string }) {
    return this.api.post<{ id: string }>('/modelprintcategories', payload);
  }

  createModelPrint(payload: ModelPrintCreate) {
    return this.api.post<ModelPrint>('/modelprints', payload);
  }

  getAllModelPrints() {
    return this.api.get<ModelPrint[]>('/modelprints');
  }
}
