import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilamentMaterialType } from '../../../../domain/models/filament-material-type.model';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { ListStateComponent } from '../../../../shared/ui/list-state/list-state.component';

@Component({
  selector: 'app-material-types-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ListStateComponent],
  templateUrl: './material-types-modal.component.html'
})
export class MaterialTypesModalComponent {
  @Input() materialTypes: FilamentMaterialType[] = [];
  @Input() loading = false;
  @Output() addMaterialType = new EventEmitter<{ name: string }>();
  @Output() close = new EventEmitter<void>();

  nameInput = '';

  onAdd(): void {
    if (this.nameInput.trim()) {
      this.addMaterialType.emit({ name: this.nameInput.trim() });
      this.nameInput = '';
    }
  }

  onClose(): void {
    this.close.emit();
  }
}