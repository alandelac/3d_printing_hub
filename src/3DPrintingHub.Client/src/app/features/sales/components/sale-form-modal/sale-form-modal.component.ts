import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, effect, signal } from '@angular/core';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { Client } from '../../../../domain/models/client.model';
import { ProductStock } from '../../../../domain/models/product-stock.model';
import { Sale } from '../../../../domain/models/sale.model';

export type SaleFormValue = {
  productStockId: string;
  clientId: string | null;
  quantity: number;
  salePrice: number;
  paymentReceived: boolean;
};

@Component({
  selector: 'app-sale-form-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal [title]="sale ? 'Edit Sale' : 'Add Sale'" (close)="cancel.emit()">
      <div class="sale-form">
        <div class="field-row">
          <label for="sale-product-stock">Product stock</label>
          <select id="sale-product-stock" [value]="productStockId()" (change)="onProductStockChange($any($event.target).value)">
            <option value="" disabled>Select a stock item</option>
            <option *ngFor="let stock of productStocks" [value]="stock.id">
              {{ stock.modelPrintName }} · {{ stock.filamentColorName }} ({{ stock.quantityInStock }} in stock)
            </option>
          </select>
        </div>

        <div class="field-row">
          <label for="sale-client">Client (optional)</label>
          <select id="sale-client" [value]="clientId() ?? ''" (change)="clientId.set($any($event.target).value || null)">
            <option value="">No client</option>
            <option *ngFor="let client of clients" [value]="client.id">{{ client.name }}</option>
          </select>
        </div>

        <div class="field-row">
          <label for="sale-quantity">Quantity</label>
          <input id="sale-quantity" type="number" min="1" [value]="quantity()" (input)="quantity.set(+($any($event.target).value || 1))" />
        </div>

        <div class="field-row">
          <label for="sale-price">Unit sale price</label>
          <input id="sale-price" type="number" step="0.01" min="0.01" [value]="salePrice()" (input)="salePrice.set(+($any($event.target).value || 0))" />
        </div>

        <label class="checkbox-row">
          <input type="checkbox" [checked]="paymentReceived()" (change)="paymentReceived.set($any($event.target).checked)" />
          <span>Payment received</span>
        </label>

        <div class="actions-row">
          <button class="secondary" type="button" (click)="cancel.emit()" [disabled]="loading">Cancel</button>
          <button class="primary" type="button" [disabled]="loading" (click)="submit()">
            {{ loading ? 'Saving...' : (sale ? 'Save Sale' : 'Add Sale') }}
          </button>
        </div>
      </div>
    </app-modal>
  `,
  styles: [`
    :host {
      display: block;
    }

    .sale-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: min(100%, 440px);
    }

    .field-row {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .field-row label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #21313f;
    }

    .field-row input,
    .field-row select {
      width: 100%;
      padding: 0.72rem 0.8rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.6rem;
      background: #fff;
      font: inherit;
      box-sizing: border-box;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .field-row input:focus,
    .field-row select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
    }

    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: 500;
      color: #1f2937;
      margin-top: 0.25rem;
    }

    .checkbox-row input {
      width: 1rem;
      height: 1rem;
      accent-color: #6b46c1;
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
      min-width: 120px;
    }
  `]
})
export class SaleFormModalComponent {
  @Input() clients: Client[] = [];
  @Input() productStocks: ProductStock[] = [];
  @Input() sale: Sale | null = null;
  @Input() loading = false;

  @Output() save = new EventEmitter<SaleFormValue>();
  @Output() cancel = new EventEmitter<void>();

  protected readonly productStockId = signal('');
  protected readonly clientId = signal<string | null>(null);
  protected readonly quantity = signal(1);
  protected readonly salePrice = signal(0);
  protected readonly paymentReceived = signal(false);

  constructor() {
    effect(() => {
      const selected = this.productStocks.find(stock => stock.id === this.productStockId());
      if (selected) {
        this.salePrice.set(selected.salePrice || selected.recommendedSalePrice || 0);
      }
    });
  }

  ngOnChanges(): void {
    if (this.sale) {
      this.productStockId.set(this.sale.productStockId);
      this.clientId.set(this.sale.clientId ?? null);
      this.quantity.set(this.sale.quantity || 1);
      this.salePrice.set(this.sale.salePrice || 0);
      this.paymentReceived.set(this.sale.paymentReceived);
      return;
    }

    this.productStockId.set(this.productStocks[0]?.id ?? '');
    this.clientId.set(null);
    this.quantity.set(1);
    this.salePrice.set(this.productStocks[0]?.salePrice || this.productStocks[0]?.recommendedSalePrice || 0);
    this.paymentReceived.set(false);
  }

  protected onProductStockChange(value: string): void {
    this.productStockId.set(value);
    const selected = this.productStocks.find(stock => stock.id === value);
    if (selected) {
      this.salePrice.set(selected.salePrice || selected.recommendedSalePrice || 0);
    }
  }

  protected submit(): void {
    const quantity = Number(this.quantity());
    const price = Number(this.salePrice());

    if (!this.productStockId()) {
      return;
    }

    this.save.emit({
      productStockId: this.productStockId(),
      clientId: this.clientId(),
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      salePrice: Number.isFinite(price) && price > 0 ? price : 0,
      paymentReceived: this.paymentReceived(),
    });
  }
}
