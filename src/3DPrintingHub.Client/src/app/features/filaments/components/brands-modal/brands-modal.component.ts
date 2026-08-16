import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilamentBrand } from '../../../../domain/models/filament-brand.model';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { ListStateComponent } from '../../../../shared/ui/list-state/list-state.component';
import { TableActionsComponent } from '../../../../shared/ui/table-actions/table-actions.component';

@Component({
  selector: 'app-brands-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ListStateComponent, TableActionsComponent],
  templateUrl: './brands-modal.component.html'
})
export class BrandsModalComponent {
  @Input() brands: FilamentBrand[] = [];
  @Input() loading = false;
  @Output() addBrand = new EventEmitter<{ name: string }>();
  @Output() updateBrand = new EventEmitter<{ id: string; name: string }>();
  @Output() deleteBrand = new EventEmitter<FilamentBrand>();
  @Output() close = new EventEmitter<void>();

  nameInput = '';
  editingId = '';

  get isEditing(): boolean {
    return this.editingId !== '';
  }

  onAdd(): void {
    if (this.isEditing) {
      if (this.nameInput.trim()) {
        this.updateBrand.emit({ id: this.editingId, name: this.nameInput.trim() });
        this.reset();
      }
    } else if (this.nameInput.trim()) {
      this.addBrand.emit({ name: this.nameInput.trim() });
      this.nameInput = '';
    }
  }

  startEdit(brand: FilamentBrand): void {
    this.editingId = brand.id;
    this.nameInput = brand.name;
  }

  cancelEdit(): void {
    this.reset();
  }

  onDelete(brand: FilamentBrand): void {
    this.deleteBrand.emit(brand);
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