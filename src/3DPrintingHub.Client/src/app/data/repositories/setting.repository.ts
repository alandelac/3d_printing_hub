import { Injectable } from '@angular/core';
import { ApiClient } from '../../core/http/api-client';
import { Setting } from '../../domain/models/setting.model';

@Injectable({ providedIn: 'root' })
export class SettingRepository {
  constructor(private api: ApiClient) {}

  getAllSettings() {
    return this.api.get<Setting[]>('/settings');
  }

  updateSetting(id: string, payload: { parameter: string; value: number }) {
    return this.api.put<Setting>(`/settings/${id}`, payload);
  }
}
