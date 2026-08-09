import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filament } from '../../../../domain/models/filament.model';

@Component({
  selector: 'app-filament-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filament-card.component.html',
  styleUrls: ['./filament-card.component.css']
})
export class FilamentCardComponent {
  @Input() filament: Filament | null = null;
  @Output() edit = new EventEmitter<Filament>();
  @Output() delete = new EventEmitter<{ id: string; name: string }>();

  onEdit(): void {
    if (this.filament) {
      this.edit.emit(this.filament);
    }
  }

  onDelete(): void {
    if (this.filament) {
      const displayName = `${this.filament.filamentProfile?.brandName} - ${this.filament.filamentProfile?.materialTypeName}`;
      this.delete.emit({ id: this.filament.id, name: displayName });
    }
  }
}