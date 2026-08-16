import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilamentColor } from '../../../../domain/models/filament-color.model';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { ListStateComponent } from '../../../../shared/ui/list-state/list-state.component';
import { TableActionsComponent } from '../../../../shared/ui/table-actions/table-actions.component';

@Component({
  selector: 'app-colors-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ListStateComponent, TableActionsComponent],
  templateUrl: './colors-modal.component.html'
})
export class ColorsModalComponent {
  @Input() colors: FilamentColor[] = [];
  @Input() loading = false;
  @Output() addColor = new EventEmitter<{ color: string; colorCode: string }>();
  @Output() updateColor = new EventEmitter<{ id: string; color: string; colorCode: string }>();
  @Output() deleteColor = new EventEmitter<FilamentColor>();
  @Output() close = new EventEmitter<void>();

  name = '';
  code = '#FFFFFF';
  editingId = '';

  get isEditing(): boolean {
    return this.editingId !== '';
  }

  onAdd(): void {
    if (!this.name.trim()) {
      return;
    }
    if (this.isEditing) {
      this.updateColor.emit({ id: this.editingId, color: this.name.trim(), colorCode: this.code });
    } else {
      this.addColor.emit({ color: this.name.trim(), colorCode: this.code });
    }
    this.reset();
  }

  startEdit(color: FilamentColor): void {
    this.editingId = color.id;
    this.name = color.color;
    this.code = color.colorCode;
  }

  cancelEdit(): void {
    this.reset();
  }

  onDelete(color: FilamentColor): void {
    this.deleteColor.emit(color);
  }

  onClose(): void {
    this.close.emit();
    this.reset();
  }

  private reset(): void {
    this.editingId = '';
    this.name = '';
    this.code = '#FFFFFF';
  }
}