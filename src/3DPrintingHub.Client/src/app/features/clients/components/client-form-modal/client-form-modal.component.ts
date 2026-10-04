import { CommonModule } from '@angular/common';
import { Component, OnChanges, SimpleChanges, input, output, signal } from '@angular/core';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { Client, ClientContactPlatform } from '../../../../domain/models/client.model';

export interface ClientFormValue {
  name: string;
  contactPlatform: ClientContactPlatform;
  phone: string;
  email: string;
}

@Component({
  selector: 'app-client-form-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal [title]="client() ? 'Edit Client' : 'Add Client'" (close)="cancel.emit()">
      <div class="client-form">
        <div class="field-row">
          <label for="client-name">Name</label>
          <input id="client-name" type="text" [value]="name()" (input)="name.set($any($event.target).value)" />
        </div>

        <div class="field-row">
          <label for="client-platform">Contact Platform</label>
          <select id="client-platform" [value]="contactPlatform()" (change)="contactPlatform.set($any($event.target).value)">
            <option value="WhatsApp">WhatsApp</option>
            <option value="Facebook">Facebook</option>
            <option value="PhoneCall">PhoneCall</option>
          </select>
        </div>

        <div class="field-row">
          <label for="client-phone">Phone</label>
          <input id="client-phone" type="tel" [value]="phone()" (input)="phone.set($any($event.target).value)" />
        </div>

        <div class="field-row">
          <label for="client-email">Email</label>
          <input id="client-email" type="email" [value]="email()" (input)="email.set($any($event.target).value)" />
        </div>

        <div class="actions-row">
          <button class="secondary" type="button" (click)="cancel.emit()" [disabled]="loading()">Cancel</button>
          <button class="primary" type="button" (click)="onSubmit()" [disabled]="loading()">
            {{ loading() ? 'Saving...' : 'Save Client' }}
          </button>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    :host {
      display: block;
    }

    .client-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: min(100%, 420px);
    }

    .field-row {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .field-row label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #21313f;
    }

    .field-row input,
    .field-row select {
      width: 100%;
      padding: 0.7rem 0.8rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      background: #fff;
      font: inherit;
      box-sizing: border-box;
    }

    .field-row input:focus,
    .field-row select:focus {
      outline: 2px solid rgba(37, 99, 235, 0.18);
      border-color: #2563eb;
    }

    .actions-row {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid #e2e8f0;
    }

    button {
      min-width: 110px;
    }
  `]
})
export class ClientFormModalComponent implements OnChanges {
  readonly client = input<Client | null>(null);
  readonly loading = input(false);

  readonly save = output<ClientFormValue>();
  readonly cancel = output<void>();

  protected readonly name = signal('');
  protected readonly contactPlatform = signal<ClientContactPlatform>(ClientContactPlatform.WhatsApp);
  protected readonly phone = signal('');
  protected readonly email = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client']) {
      const current = this.client();
      if (current) {
        this.name.set(current.name ?? '');
        this.contactPlatform.set(current.contactPlatform ?? ClientContactPlatform.WhatsApp);
        this.phone.set(current.phone ?? '');
        this.email.set(current.email ?? '');
        return;
      }

      this.name.set('');
      this.contactPlatform.set(ClientContactPlatform.WhatsApp);
      this.phone.set('');
      this.email.set('');
    }
  }

  protected onSubmit(): void {
    this.save.emit({
      name: this.name(),
      contactPlatform: this.contactPlatform(),
      phone: this.phone(),
      email: this.email()
    });
  }
}
