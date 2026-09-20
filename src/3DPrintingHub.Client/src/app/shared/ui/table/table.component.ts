import { Component, Directive, InputSignal, TemplateRef, contentChildren, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListStateComponent } from '../list-state/list-state.component';
import { TableActionsComponent } from '../table-actions/table-actions.component';

/**
 * Configuration for one column of the shared table.
 *
 * `key` is the stable identifier used by the `appTableCell` / `appTableHeader`
 * templates; `header` is the fallback label; `value` renders the default cell
 * and `cssClass` is added to the column's header and cells.
 */
export interface TableColumn<T> {
  key: string;
  header: string;
  value?: (row: T) => string | number | boolean | null | undefined;
  cssClass?: string;
}

/**
 * Registers a custom cell renderer for a column.
 *
 * Usage:
 *   <ng-template appTableCell="remainingWeight" let-filament>
 *     {{ filament.remainingWeightGrams }}g
 *   </ng-template>
 */
@Directive({
  selector: 'ng-template[appTableCell]',
  standalone: true
})
export class TableCellDirective {
  readonly appTableCell = input.required<string>();

  constructor(readonly templateRef: TemplateRef<unknown>) {}
}

/**
 * Registers a custom header cell for a column. The template renders the whole
 * `<th>` so a page can keep its own header markup (for example a sortable
 * header bound to a page-level click handler).
 *
 * Usage:
 *   <ng-template appTableHeader="profile" let-column>
 *     <th class="sortable" (click)="toggleSort('profile')">{{ column.header }}{{ sortIndicator('profile') }}</th>
 *   </ng-template>
 */
@Directive({
  selector: 'ng-template[appTableHeader]',
  standalone: true
})
export class TableHeaderDirective {
  readonly appTableHeader = input.required<string>();

  constructor(readonly templateRef: TemplateRef<unknown>) {}
}

/**
 * Presentational table used by every feature list.
 *
 * It owns the `.table-scroll` wrapper, the table shell and the shared
 * loading / empty states (through `app-list-state`), renders each cell with
 * `column.value(row)` or a custom `appTableCell` template, and optionally
 * appends an actions column that re-emits `edit` / `delete` with the row.
 *
 * It is presentational only: sorting and filtering stay in the pages (Phase 9
 * replaces them with the sortable/filterable table).
 *
 * Usage:
 *   <app-table
 *     [columns]="columns"
 *     [rows]="rows"
 *     [loading]="loading"
 *     emptyText="No items found."
 *     (edit)="startEdit($event)"
 *     (delete)="confirmDelete($event)">
 *     <ng-template appTableCell="name" let-row>...</ng-template>
 *   </app-table>
 */
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, ListStateComponent, TableActionsComponent],
  template: `
    <app-list-state [loading]="loading()" [hasData]="rows().length > 0" [emptyText]="emptyText()">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <ng-container *ngFor="let column of columns()">
                <ng-container *ngIf="headerTemplate(column.key) as header">
                  <ng-container *ngTemplateOutlet="header; context: { $implicit: column }"></ng-container>
                </ng-container>
                <th *ngIf="!headerTemplate(column.key)" [class]="column.cssClass">{{ column.header }}</th>
              </ng-container>
              <th *ngIf="showActions()">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows()">
              <td *ngFor="let column of columns()" [class]="column.cssClass">
                <ng-container *ngIf="cellTemplate(column.key) as cell">
                  <ng-container *ngTemplateOutlet="cell; context: { $implicit: row }"></ng-container>
                </ng-container>
                <ng-container *ngIf="!cellTemplate(column.key)">{{ column.value ? column.value(row) : '' }}</ng-container>
              </td>
              <td *ngIf="showActions()">
                <app-table-actions (edit)="edit.emit(row)" (delete)="delete.emit(row)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-list-state>
  `
})
export class TableComponent<T = unknown> {
  readonly columns: InputSignal<TableColumn<T>[]> = input<TableColumn<T>[]>([]);
  readonly rows = input<T[]>([]);
  readonly loading = input(false);
  readonly emptyText = input('No results found.');
  readonly showActions = input(true);

  readonly edit = output<T>();
  readonly delete = output<T>();

  protected readonly cellTemplates = contentChildren(TableCellDirective);
  protected readonly headerTemplates = contentChildren(TableHeaderDirective);

  protected cellTemplate(key: string): TemplateRef<unknown> | null {
    return this.cellTemplates().find(template => template.appTableCell() === key)?.templateRef ?? null;
  }

  protected headerTemplate(key: string): TemplateRef<unknown> | null {
    return this.headerTemplates().find(template => template.appTableHeader() === key)?.templateRef ?? null;
  }
}
