import { Component, OnChanges, SimpleChanges, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { ModelPrintCategory } from '../../../../domain/models/model-print-category.model';
import { ModelPrint } from '../../../../domain/models/model-print.model';

export interface ModelFormValue {
  name: string;
  categoryId: string;
  estimatedWeightGrams: number | null;
  estimatedTimeMinutes: number | null;
  fileLocationOrUrl: string;
  notes: string;
}

/**
 * Feature component that owns the create/edit model form markup and its fields.
 * The page keeps the state and the repository call; this component presents the
 * form, tracks what the operator typed and emits the values on submit.
 */
@Component({
  selector: 'app-model-form-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './model-form-modal.component.html'
})
export class ModelFormModalComponent implements OnChanges {
  readonly categories = input<ModelPrintCategory[]>([]);
  readonly model = input<ModelPrint | null>(null);
  readonly loading = input(false);

  readonly save = output<ModelFormValue>();
  readonly cancel = output<void>();

  protected readonly name = signal('');
  protected readonly categoryId = signal('');
  protected readonly estimatedWeightGrams = signal<number | null>(null);
  protected readonly estimatedTimeMinutes = signal<number | null>(null);
  protected readonly fileLocationOrUrl = signal('');
  protected readonly notes = signal('');

  protected isEdit(): boolean {
    return this.model() !== null;
  }

  protected idPrefix(): string {
    return this.isEdit() ? 'editModel' : 'model';
  }

  protected submitLabel(): string {
    if (this.loading()) {
      return this.isEdit() ? 'Saving...' : 'Creating...';
    }

    return this.isEdit() ? 'Save Changes' : 'Create Model';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['model'] && !changes['categories']) {
      return;
    }

    const model = this.model();

    if (model) {
      this.name.set(model.name);
      this.categoryId.set(model.categoryId);
      this.estimatedWeightGrams.set(model.estimatedWeightGrams);
      this.estimatedTimeMinutes.set(model.estimatedTimeMinutes);
      this.fileLocationOrUrl.set(model.fileLocationOrUrl ?? '');
      this.notes.set(model.notes ?? '');
      return;
    }

    this.name.set('');
    this.categoryId.set(this.categories().length > 0 ? this.categories()[0].id : '');
    this.estimatedWeightGrams.set(0);
    this.estimatedTimeMinutes.set(0);
    this.fileLocationOrUrl.set('');
    this.notes.set('');
  }

  protected onNumberInput(target: 'estimatedWeightGrams' | 'estimatedTimeMinutes', value: string): void {
    const parsed = value ? +value : null;

    if (target === 'estimatedWeightGrams') {
      this.estimatedWeightGrams.set(parsed);
    } else {
      this.estimatedTimeMinutes.set(parsed);
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    this.save.emit({
      name: this.name(),
      categoryId: this.categoryId(),
      estimatedWeightGrams: this.estimatedWeightGrams(),
      estimatedTimeMinutes: this.estimatedTimeMinutes(),
      fileLocationOrUrl: this.fileLocationOrUrl(),
      notes: this.notes()
    });
  }
}
