import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FilamentBrand } from '../../../../domain/models/filament-brand.model';

@Component({
  selector: 'app-brands-modal',
  standalone: true,
  templateUrl: './brands-modal.component.html',
  styleUrls: ['./brands-modal.component.css']
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