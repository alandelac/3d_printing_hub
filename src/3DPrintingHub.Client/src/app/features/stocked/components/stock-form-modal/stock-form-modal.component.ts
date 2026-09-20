import { Component, OnChanges, SimpleChanges, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { ModelPrint } from '../../../../domain/models/model-print.model';
import { Filament } from '../../../../domain/models/filament.model';
import { ProductStock } from '../../../../domain/models/product-stock.model';

export interface StockFormValue {
  modelPrintId: string;
  filamentId: string;
  quantityInStock: number;
  salePrice: number;
}

/**
 * Feature component that owns the create/edit product-stock form markup and
 * its fields, including the model and filament selects.
 * The page keeps the state and the repository call.
 */
@Component({
  selector: 'app-stock-form-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './stock-form-modal.component.html'
})
export class StockFormModalComponent implements OnChanges {
  readonly models = input<ModelPrint[]>([]);
  readonly filaments = input<Filament[]>([]);
  readonly stock = input<ProductStock | null>(null);
  readonly loading = input(false);

  readonly save = output<StockFormValue>();
  readonly cancel = output<void>();

  protected readonly modelPrintId = signal('');
  protected readonly filamentId = signal('');
  protected readonly quantityInStock = signal(0);
  protected readonly salePrice = signal(0);

  protected isEditing(): boolean {
    return this.stock() !== null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['stock'] && !changes['models'] && !changes['filaments']) {
      return;
    }

    const stock = this.stock();

    if (stock) {
      this.modelPrintId.set(stock.modelPrintId);
      this.filamentId.set(stock.filamentId);
      this.quantityInStock.set(stock.quantityInStock);
      this.salePrice.set(stock.salePrice);
      return;
    }

    this.modelPrintId.set(this.models().length ? this.models()[0].id : '');
    this.filamentId.set(this.filaments().length ? this.filaments()[0].id : '');
    this.quantityInStock.set(0);
    this.salePrice.set(0);
  }

  protected onQuantityInput(value: string): void {
    this.quantityInStock.set(value ? +value : 0);
  }

  protected onSalePriceInput(value: string): void {
    this.salePrice.set(value ? +value : 0);
  }

  protected onSave(): void {
    this.save.emit({
      modelPrintId: this.modelPrintId(),
      filamentId: this.filamentId(),
      quantityInStock: this.quantityInStock(),
      salePrice: this.salePrice()
    });
  }
}
