import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { Filament } from '../../../domain/models/filament.model';
import { ModelPrint } from '../../../domain/models/model-print.model';

export interface PrintJobFormValue {
  modelPrintId: string;
  filamentId: string;
  producedQuantity: number;
  usedWeightGrams: number;
  notes: string;
}

@Component({
  selector: 'app-print-job-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './print-job-form.component.html'
})
export class PrintJobFormComponent implements OnChanges {
  @Input() models: ModelPrint[] = [];
  @Input() filaments: Filament[] = [];
  @Input() loading = false;

  @Output() save = new EventEmitter<PrintJobFormValue>();
  @Output() cancel = new EventEmitter<void>();

  protected readonly modelPrintId = signal('');
  protected readonly filamentId = signal('');
  protected readonly producedQuantity = signal<number | string>('');
  protected readonly usedWeightGrams = signal<number | string>('');
  protected readonly notes = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['models'] && this.models.length > 0 && !this.modelPrintId()) {
      this.modelPrintId.set(this.models[0].id);
    }

    if (changes['filaments'] && this.filaments.length > 0 && !this.filamentId()) {
      this.filamentId.set(this.filaments[0].id);
    }
  }

  protected calculatedWeightGrams(): number {
    const model = this.models.find(candidate => candidate.id === this.modelPrintId());
    const quantity = Number(this.producedQuantity());

    return model && Number.isFinite(quantity) && quantity > 0
      ? model.estimatedWeightGrams * quantity
      : 0;
  }

  protected onSubmit(): void {
    const payload: PrintJobFormValue = {
      modelPrintId: this.modelPrintId(),
      filamentId: this.filamentId(),
      producedQuantity: Number(this.producedQuantity()),
      usedWeightGrams: this.calculatedWeightGrams(),
      notes: this.notes()
    };

    this.save.emit(payload);
  }
}
