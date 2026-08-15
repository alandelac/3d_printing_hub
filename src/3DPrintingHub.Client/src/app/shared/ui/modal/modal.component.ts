import { Component, input, output } from '@angular/core';

/**
 * Presentational modal shell used across features.
 * Owns the backdrop, header (title + close button) and body wrapper.
 *
 * Usage:
 *   <app-modal title="My Title" (close)="onClose()">
 *     ...body content...
 *   </app-modal>
 *
 * Styling lives in the global `styles.css` (.modal/.modal-backdrop/.modal-content/.body).
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div class="modal">
      <div class="modal-backdrop" (click)="close.emit()"></div>
      <div class="modal-content">
        <header>
          <h3>{{ title() }}</h3>
          <button class="close" (click)="close.emit()">✕</button>
        </header>
        <div class="body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly close = output<void>();
}