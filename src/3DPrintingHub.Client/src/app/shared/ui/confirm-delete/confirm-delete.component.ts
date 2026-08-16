import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

/**
 * Reusable "Are you sure you want to delete…" confirmation modal (DRY).
 * Wraps the shared app-modal shell with a consistent confirm/cancel layout.
 *
 * Usage:
 *   <app-confirm-delete
 *     [title]="entityName()"
 *     [entityName]="entityName()"
 *     [loading]="deleteLoading()"
 *     (confirm)="confirmDelete()"
 *     (cancel)="closeDeleteModal()"
 *   />
 */
@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [ModalComponent],
  template: `
    <app-modal [title]="title()" (close)="cancel.emit()">
      <div class="add-form">
        <p>Are you sure you want to delete <strong>{{ entityName() }}</strong>? This action cannot be undone.</p>

        <div class="modal-actions">
          <button class="danger" (click)="confirm.emit()" [disabled]="loading()">Yes, Delete</button>
          <button class="secondary" (click)="cancel.emit()" [disabled]="loading()">Cancel</button>
        </div>
      </div>
    </app-modal>
  `
})
export class ConfirmDeleteComponent {
  readonly title = input<string>('Delete');
  readonly entityName = input<string>('');
  readonly loading = input<boolean>(false);
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}