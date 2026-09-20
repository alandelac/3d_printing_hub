import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { TableColumn, TableComponent } from '../../../../shared/ui/table/table.component';
import { ModelPrintCategory } from '../../../../domain/models/model-print-category.model';

export interface CategoryFormValue {
  id: string;
  name: string;
}

/**
 * Feature component that owns the Categories modal: the add/edit form and the
 * category list rendered through the shared table.
 * The page keeps the state and the repository calls.
 */
@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, TableComponent],
  templateUrl: './category-modal.component.html'
})
export class CategoryModalComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);
  @ViewChild('nameInputElement') private nameInputElement?: ElementRef<HTMLInputElement>;
  readonly categories = input<ModelPrintCategory[]>([]);
  readonly loading = input(false);

  readonly save = output<CategoryFormValue>();
  readonly remove = output<ModelPrintCategory>();
  readonly close = output<void>();

  protected readonly columns: TableColumn<ModelPrintCategory>[] = [
    { key: 'name', header: 'Name', value: category => category.name }
  ];

  protected readonly nameInput = signal('');
  protected readonly editingId = signal('');

  protected isEditing(): boolean {
    return this.editingId() !== '';
  }

  protected startEdit(category: ModelPrintCategory): void {
    this.editingId.set(category.id);
    this.nameInput.set(category.name);
  }

  protected cancelEdit(): void {
    this.reset();
  }

  protected onAdd(): void {
    const name = this.nameInput().trim();

    if (!name) {
      return;
    }

    this.save.emit({ id: this.editingId(), name });
    this.reset();
    this.changeDetector.detectChanges();
  }

  protected onNameInput(value: string): void {
    this.nameInput.set(value);
  }

  protected onClose(): void {
    this.close.emit();
    this.reset();
    this.changeDetector.detectChanges();
  }

  private reset(): void {
    this.editingId.set('');
    this.nameInput.set('');
    if (this.nameInputElement) {
      this.nameInputElement.nativeElement.value = '';
    }
  }
}
