import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ClientRepository } from '../../../data/repositories/client.repository';
import { Client, ClientContactPlatform, ClientCreate, ClientUpdate } from '../../../domain/models/client.model';
import { ConfirmDeleteComponent } from '../../../shared/ui/confirm-delete/confirm-delete.component';
import { TableCellDirective, TableColumn, TableComponent } from '../../../shared/ui/table/table.component';
import { ClientFormModalComponent, ClientFormValue } from '../components/client-form-modal/client-form-modal.component';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [CommonModule, TableComponent, TableCellDirective, ClientFormModalComponent, ConfirmDeleteComponent],
  template: `
    <section class="clients-page">
      <h2>{{ title() }}</h2>

      <div class="actions">
        <button class="primary" type="button" (click)="openCreateModal()">Add Client</button>
      </div>

      <app-client-form-modal
        *ngIf="clientOpen()"
        [client]="editingClient()"
        [loading]="loading()"
        (save)="saveClient($event)"
        (cancel)="closeClientModal()"
      />

      <app-confirm-delete
        *ngIf="archiveOpen()"
        [title]="'Archive'"
        [entityName]="archiveName()"
        [description]="'Are you sure you want to archive'"
        [details]="'History will be retained, but this client will leave the active list.'"
        [confirmLabel]="'Yes, Archive'"
        [loading]="archiveLoading()"
        (confirm)="confirmArchive()"
        (cancel)="closeArchiveModal()"
      />

      <app-table
        [columns]="columns"
        [rows]="clients()"
        [loading]="clientsLoading()"
        emptyText="No clients found."
        filterPlaceholder="Filter clients…"
        [showActions]="false"
      >
        <ng-template appTableCell="contactPlatform" let-client>
          {{ client.contactPlatform }}
        </ng-template>

        <ng-template appTableCell="actions" let-client>
          <button class="secondary" type="button" (click)="openEditClient(client)">Edit</button>
          <button class="danger" type="button" (click)="openArchiveConfirm(client)">Archive</button>
        </ng-template>
      </app-table>

      <p *ngIf="validationError()" class="validation-error">{{ validationError() }}</p>
    </section>
  `
})
export class ClientsPageComponent implements OnInit {
  private readonly clientRepository = inject(ClientRepository);

  protected readonly title = signal('Clients');
  protected readonly clients = signal<Client[]>([]);
  protected readonly clientsLoading = signal(false);
  protected readonly clientOpen = signal(false);
  protected readonly editingClient = signal<Client | null>(null);
  protected readonly loading = signal(false);
  protected readonly validationError = signal<string | null>(null);
  protected readonly archiveOpen = signal(false);
  protected readonly archiveLoading = signal(false);
  protected readonly archiveName = signal('');
  private pendingArchive: (() => Promise<void>) | null = null;

  protected readonly columns: TableColumn<Client>[] = [
    { key: 'name', header: 'Name', value: client => client.name },
    { key: 'contactPlatform', header: 'Contact Platform', value: client => client.contactPlatform },
    { key: 'phone', header: 'Phone', value: client => client.phone ?? '' },
    { key: 'email', header: 'Email', value: client => client.email ?? '' },
    { key: 'actions', header: 'Actions', sortable: false, filterable: false }
  ];

  async ngOnInit(): Promise<void> {
    await this.loadClients();
  }

  protected async loadClients(): Promise<void> {
    this.clientsLoading.set(true);
    try {
      this.clients.set(await firstValueFrom(this.clientRepository.getClients()));
      this.validationError.set(null);
    } catch (error) {
      console.error('Error loading clients:', error);
      alert(`Error: ${error}`);
    } finally {
      this.clientsLoading.set(false);
    }
  }

  protected openCreateModal(): void {
    this.editingClient.set(null);
    this.validationError.set(null);
    this.clientOpen.set(true);
  }

  protected closeClientModal(): void {
    this.clientOpen.set(false);
    this.editingClient.set(null);
    this.validationError.set(null);
  }

  protected openArchiveConfirm(client: Client): void {
    this.archiveName.set(client.name);
    this.pendingArchive = async () => {
      await firstValueFrom(this.clientRepository.archiveClient(client.id));
      this.clients.set(this.clients().filter(existing => existing.id !== client.id));
    };
    this.archiveOpen.set(true);
  }

  protected closeArchiveModal(): void {
    this.archiveOpen.set(false);
    this.archiveName.set('');
    this.pendingArchive = null;
  }

  protected async confirmArchive(): Promise<void> {
    const action = this.pendingArchive;
    this.pendingArchive = null;

    if (!action) {
      this.closeArchiveModal();
      return;
    }

    this.archiveLoading.set(true);

    try {
      await action();
      this.closeArchiveModal();
    } catch (error) {
      console.error('Error archiving client:', error);
      alert(`Error: ${error}`);
    } finally {
      this.archiveLoading.set(false);
    }
  }

  protected openEditClient(client: Client): void {
    this.editingClient.set(client);
    this.validationError.set(null);
    this.clientOpen.set(true);
  }

  protected async saveClient(value: ClientFormValue): Promise<void> {
    const trimmedName = value.name.trim();
    if (!trimmedName) {
      this.validationError.set('Name is required');
      return;
    }

    const payload = {
      name: trimmedName,
      contactPlatform: value.contactPlatform ?? ClientContactPlatform.WhatsApp,
      phone: value.phone.trim() || null,
      email: value.email.trim() || null
    };

    this.loading.set(true);
    this.validationError.set(null);

    try {
      const editingClient = this.editingClient();
      if (editingClient) {
        const updatePayload: ClientUpdate = {
          id: editingClient.id,
          ...payload
        };
        await firstValueFrom(this.clientRepository.updateClient(updatePayload));
      } else {
        const createPayload: ClientCreate = payload;
        await firstValueFrom(this.clientRepository.createClient(createPayload));
      }

      this.closeClientModal();
      await this.loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      this.validationError.set(`Error: ${error}`);
      alert(`Error: ${error}`);
    } finally {
      this.loading.set(false);
    }
  }
}
