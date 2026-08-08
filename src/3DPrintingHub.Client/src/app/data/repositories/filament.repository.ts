import { Injectable } from '@angular/core';
import { ApiClient } from '../../core/http/api-client';
import { FilamentColor } from '../../domain/models/filament-color.model';
import { FilamentBrand } from '../../domain/models/filament-brand.model';
import { FilamentMaterialType } from '../../domain/models/filament-material-type.model';
import { FilamentProfile, FilamentProfileCreate } from '../../domain/models/filament-profile.model';
import { Filament, FilamentCreate } from '../../domain/models/filament.model';

@Injectable({ providedIn: 'root' })
export class FilamentRepository {
  constructor(private api: ApiClient) {}

  getColors() {
    return this.api.get<FilamentColor[]>('/filamentcolors');
  }

  createColor(payload: { color: string; colorCode: string }) {
    return this.api.post('/filamentcolors', payload);
  }

  getBrands() {
    return this.api.get<FilamentBrand[]>('/brand');
  }

  createBrand(payload: { name: string }) {
    return this.api.post('/brand', payload);
  }

  getMaterialTypes() {
    return this.api.get<FilamentMaterialType[]>('/materialtype');
  }

  createMaterialType(payload: { name: string }) {
    return this.api.post('/materialtype', payload);
  }

  getFilamentProfiles() {
    return this.api.get<FilamentProfile[]>('/filamentprofiles');
  }

  createFilamentProfile(payload: FilamentProfileCreate) {
    return this.api.post<{ id: string }>('/filamentprofiles', payload);
  }

  getFilaments() {
    return this.api.get<Filament[]>('/filaments');
  }

  createFilament(payload: FilamentCreate) {
    return this.api.post<{ id: string }>('/filaments', payload);
  }
}
