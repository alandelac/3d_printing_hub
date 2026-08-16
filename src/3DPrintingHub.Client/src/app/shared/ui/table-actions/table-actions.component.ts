import { Component, output } from '@angular/core';

/**
 * Reusable Edit + Delete action buttons for table rows (DRY).
 *
 * Usage:
 *   <app-table-actions (edit)="startEdit(item)" (delete)="openDelete(item)" />
 */
@Component({
  selector: 'app-table-actions',
  standalone: true,
  template: `
    <div class="table-actions">
      <button class="secondary" (click)="edit.emit()">Edit</button>
      <button class="danger" (click)="delete.emit()">Delete</button>
    </div>
  `,
  styles: [`
    .table-actions { display: inline-flex; gap: 0.4rem; white-space: nowrap; }
  `]
})
export class TableActionsComponent {
  readonly edit = output<void>();
  readonly delete = output<void>();
}