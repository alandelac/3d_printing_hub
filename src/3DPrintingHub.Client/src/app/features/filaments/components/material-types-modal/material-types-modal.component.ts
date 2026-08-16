import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilamentMaterialType } from '../../../../domain/models/filament-material-type.model';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { ListStateComponent } from '../../../../shared/ui/list-state/list-state.component';
import { TableActionsComponent } from '../../../../shared/ui/table-actions/table-actions.component';

@Component({
  selector: 'app-material-types-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ListStateComponent, TableActionsComponent],
  templateUrl: './material-types-modal.component.html'
})
export class MaterialTypesModalComponent {
  @Input() materialTypes: FilamentMaterialType[] = [];
  @Input() loading = false;
  @Output() addMaterialType = new EventEmitter<{ name: string }>();
  @Output() updateMaterialType = new EventEmitter<{ id: string; name: string }>();
  @Output() deleteMaterialType = new EventEmitter<FilamentMaterialType>();
  @Output() close = new EventEmitter<void>();

  nameInput = '';
  editingId = '';

  get isEditing(): boolean {
    return this.editingId !== '';
  }

  onAdd(): void {
    if (this.isEditing) {
      if (this.nameInput.trim()) {
        this.updateMaterialType.emit({ id: this.editingId, name: this.nameInput.trim() });
        this.reset();
      }
    } else if (this.nameInput.trim()) {
      this.addMaterialType.emit({ name: this.nameInput.trim() });
      this.nameInput = '';
    }
  }

  startEdit(mt: FilamentMaterialType): void {
    this.editingId = mt.id;
    this.nameInput = mt.name;
  }

  cancelEdit(): void {
    this.reset();
  }

  onDelete(mt: FilamentMaterialType): void {
    this.deleteMaterialType.emit(mt);
  }

  onClose(): void {
    this.close.emit();
    this.reset();
  }

  private reset(): void {
    this.editingId = '';
    this.nameInput = '';
  }
}