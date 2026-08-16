import { Injectable } from '@angular/core';
import { ApiClient } from '../../core/http/api-client';
import { FilamentColor } from '../../domain/models/filament-color.model';
import { FilamentBrand } from '../../domain/models/filament-brand.model';
import { FilamentMaterialType } from '../../domain/models/filament-material-type.model';
import { FilamentProfile, FilamentProfileCreate, FilamentProfileUpdate } from '../../domain/models/filament-profile.model';
import { Filament, FilamentCreate, FilamentUpdate, AdjustFilamentWeight } from '../../domain/models/filament.model';

@Injectable({ providedIn: 'root' })
export class FilamentRepository {
  constructor(private api: ApiClient) {}

  getColors() {
    return this.api.get<FilamentColor[]>('/filamentcolors');
  }

  createColor(payload: { color: string; colorCode: string }) {
    return this.api.post('/filamentcolors', payload);
  }

  updateColor(payload: { id: string; color: string; colorCode: string }) {
    return this.api.put(`/filamentcolors/${payload.id}`, payload);
  }

  deleteColor(id: string) {
    return this.api.delete(`/filamentcolors/${id}`);
  }

  getBrands() {
    return this.api.get<FilamentBrand[]>('/brand');
  }

  createBrand(payload: { name: string }) {
    return this.api.post('/brand', payload);
  }

  updateBrand(payload: { id: string; name: string }) {
    return this.api.put(`/brand/${payload.id}`, payload);
  }

  deleteBrand(id: string) {
    return this.api.delete(`/brand/${id}`);
  }

  getMaterialTypes() {
    return this.api.get<FilamentMaterialType[]>('/materialtype');
  }

  createMaterialType(payload: { name: string }) {
    return this.api.post('/materialtype', payload);
  }

  updateMaterialType(payload: { id: string; name: string }) {
    return this.api.put(`/materialtype/${payload.id}`, payload);
  }

  deleteMaterialType(id: string) {
    return this.api.delete(`/materialtype/${id}`);
  }

  getFilamentProfiles() {
    return this.api.get<FilamentProfile[]>('/filamentprofiles');
  }

  createFilamentProfile(payload: FilamentProfileCreate) {
    return this.api.post<{ id: string }>('/filamentprofiles', payload);
  }

  updateFilamentProfile(payload: FilamentProfileUpdate) {
    return this.api.put<FilamentProfile>(`/filamentprofiles/${payload.id}`, payload);
  }

  deleteFilamentProfile(id: string) {
    return this.api.delete(`/filamentprofiles/${id}`);
  }

  getFilaments() {
    return this.api.get<Filament[]>('/filaments');
  }

  createFilament(payload: FilamentCreate) {
    return this.api.post<{ id: string }>('/filaments', payload);
  }

  updateFilament(payload: FilamentUpdate) {
    return this.api.put<Filament>('/filaments', payload);
  }

  deleteFilament(id: string) {
    return this.api.delete(`/filaments/${id}`);
  }

  adjustFilamentWeight(payload: AdjustFilamentWeight) {
    return this.api.put<Filament>(`/filaments/${payload.filamentId}/adjust-weight`, payload);
  }
}
