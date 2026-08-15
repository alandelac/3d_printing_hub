import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilamentBrand } from '../../../../domain/models/filament-brand.model';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { ListStateComponent } from '../../../../shared/ui/list-state/list-state.component';

@Component({
  selector: 'app-brands-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ListStateComponent],
  templateUrl: './brands-modal.component.html'
})
export class BrandsModalComponent {
  @Input() brands: FilamentBrand[] = [];
  @Input() loading = false;
  @Output() addBrand = new EventEmitter<{ name: string }>();
  @Output() close = new EventEmitter<void>();

  nameInput = '';

  onAdd(): void {
    if (this.nameInput.trim()) {
      this.addBrand.emit({ name: this.nameInput.trim() });
      this.nameInput = '';
    }
  }

  onClose(): void {
    this.close.emit();
  }
}