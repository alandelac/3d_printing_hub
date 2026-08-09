import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FilamentMaterialType } from '../../../../domain/models/filament-material-type.model';

@Component({
  selector: 'app-material-types-modal',
  standalone: true,
  templateUrl: './material-types-modal.component.html',
  styleUrls: ['./material-types-modal.component.css']
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