import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilamentColor } from '../../../../domain/models/filament-color.model';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { ListStateComponent } from '../../../../shared/ui/list-state/list-state.component';

@Component({
  selector: 'app-colors-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ListStateComponent],
  templateUrl: './colors-modal.component.html'
})
export class ColorsModalComponent {
  @Input() colors: FilamentColor[] = [];
  @Input() loading = false;
  @Output() addColor = new EventEmitter<{ color: string; colorCode: string }>();
  @Output() close = new EventEmitter<void>();

  name = '';
  code = '#FFFFFF';

  onAdd(): void {
    if (this.name.trim()) {
      this.addColor.emit({ color: this.name.trim(), colorCode: this.code });
      this.name = '';
      this.code = '#FFFFFF';
    }
  }

  onClose(): void {
    this.close.emit();
  }
}