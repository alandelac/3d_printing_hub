import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../core/http/api-client';
import { Client, ClientCreate, ClientUpdate } from '../../domain/models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientRepository {
  private readonly api = inject(ApiClient);

  getClients() {
    return this.api.get<Client[]>('/clients');
  }

  getClient(id: string) {
    return this.api.get<Client>(`/clients/${id}`);
  }

  createClient(payload: ClientCreate) {
    return this.api.post<{ id: string }>('/clients', payload);
  }

  updateClient(payload: ClientUpdate) {
    return this.api.put<Client>(`/clients/${payload.id}`, payload);
  }
}
