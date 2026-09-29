import {
  Component,
  Directive,
  InputSignal,
  ModelSignal,
  TemplateRef,
  computed,
  contentChildren,
  input,
  model,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListStateComponent } from '../list-state/list-state.component';
import { TableActionsComponent } from '../table-actions/table-actions.component';

/** Value a column exposes for the shared sorting and filtering. */
export type TableValue = string | number | boolean | Date | null | undefined;

export type TableSortDirection = 'asc' | 'desc';

export interface TableSortState {
  key: string;
  direction: TableSortDirection;
}

/**
 * Configuration for one column of the shared table.
 *
 * `key` is the stable identifier used by the `appTableCell` / `appTableHeader`
 * templates; `header` is the fallback label; `value` renders the default cell
 * (and feeds the shared filter) and `cssClass` is added to the column's header
 * and cells.
 *
 * Sorting and filtering are owned by this component. A column participates in
 * both as soon as it exposes a `value` (or a `sortValue`); set `sortable` or
 * `filterable` explicitly to opt a column in or out.
 */
export interface TableColumn<T> {
  key: string;
  header: string;
  value?: (row: T) => TableValue;
  cssClass?: string;
  /** Renders a sortable header. Default: true when the column has a value. */
  sortable?: boolean;
  /** Raw value used for ordering when it differs from the rendered `value`. */
  sortValue?: (row: T) => TableValue;
  /** Includes the column in the shared text filter. Default: true when the column has a value. */
  filterable?: boolean;
}

/**
 * Orders two raw column values: strings compare case-insensitively, numbers and
 * booleans compare by magnitude, and empty values always sink to the bottom.
 */
function compareValues(a: TableValue, b: TableValue, direction: TableSortDirection): number {
  const factor = direction === 'asc' ? 1 : -1;

  if (a === b) return 0;
  if (a === null || a === undefined || a === '') return 1;
  if (b === null || b === undefined || b === '') return -1;

  if (a instanceof Date && b instanceof Date) return (a.getTime() - b.getTime()) * factor;
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * factor;
  if (typeof a === 'boolean' && typeof b === 'boolean') return (a === b ? 0 : a ? 1 : -1) * factor;

  return String(a).toLowerCase().localeCompare(String(b).toLowerCase()) * factor;
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
 * Registers a fully custom header cell for a column. The template renders the
 * whole `<th>` and takes precedence over the shared sortable header, for the
 * rare column that needs header content the shared shell cannot derive.
 *
 * Usage:
 *   <ng-template appTableHeader="profile" let-column>
 *     <th>{{ column.header }}</th>
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
 * Presentational list shell used by every feature table.
 *
 * It owns the filter bar, the table shell, the shared loading / empty / no-match
 * states (through `app-list-state`), the column ordering and the row ordering:
 * pages only supply rows plus column metadata. Cells render through
 * `column.value(row)` or a custom `appTableCell` template, and an optional
 * trailing actions column re-emits `edit` / `delete` with the row.
 *
 * Sorting and filtering state is exposed through two-way bindable inputs
 * (`filter`, `sortKey`, `sortDirection`) so a specialised table can pre-sort,
 * clear or observe them without re-implementing the shell.
 *
 * Usage:
 *   <app-table
 *     [columns]="columns"
 *     [rows]="rows"
 *     [loading]="loading"
 *     emptyText="No items found."
 *     filterPlaceholder="Filter items…"
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
    <div class="filter-bar" *ngIf="filterVisible()">
      <input
        type="text"
        class="filter-input"
        [placeholder]="filterPlaceholder()"
        [value]="filter()"
        (input)="onFilterInput($any($event.target).value)"
      />
    </div>

    <app-list-state [loading]="loading()" [hasData]="visibleRows().length > 0" [emptyText]="emptyMessage()">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <ng-container *ngFor="let column of columns()">
                <ng-container *ngIf="headerTemplate(column.key) as header">
                  <ng-container *ngTemplateOutlet="header; context: { $implicit: column }"></ng-container>
                </ng-container>
                <th
                  *ngIf="!headerTemplate(column.key)"
                  [class]="columnClasses(column)"
                  [attr.aria-sort]="ariaSort(column)"
                  (click)="sortBy(column)"
                >{{ column.header }}{{ sortIndicator(column.key) }}</th>
              </ng-container>
              <th *ngIf="showActions()">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of visibleRows()">
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
  `,
  styles: [`
    .filter-bar {
      margin-bottom: 0.5rem;
    }

    .filter-input {
      width: 100%;
      max-width: 320px;
      padding: 0.4rem 0.6rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    th.sortable {
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }

    th.sortable:hover {
      text-decoration: underline;
    }
  `]
})
export class TableComponent<T = unknown> {
  readonly columns: InputSignal<TableColumn<T>[]> = input<TableColumn<T>[]>([]);
  readonly rows = input<T[]>([]);
  readonly loading = input(false);
  readonly emptyText = input('No results found.');
  readonly noMatchText = input('No results match the current filter.');
  readonly showActions = input(true);
  readonly showFilter = input(true);
  readonly filterPlaceholder = input('Filter…');

  /** Current filter term. Two-way bindable for specialised tables. */
  readonly filter: ModelSignal<string> = model('');
  /** Column key the rows are ordered by. Empty means the source order. */
  readonly sortKey: ModelSignal<string> = model('');
  readonly sortDirection: ModelSignal<TableSortDirection> = model<TableSortDirection>('asc');

  readonly sortChange = output<TableSortState>();
  readonly edit = output<T>();
  readonly delete = output<T>();

  protected readonly cellTemplates = contentChildren(TableCellDirective);
  protected readonly headerTemplates = contentChildren(TableHeaderDirective);

  /** Rows the shell renders: filtered first, then ordered by the sorted column. */
  protected readonly visibleRows = computed<T[]>(() => this.sortRows(this.filterRows(this.rows())));

  /** The filter bar only renders when the table actually has something to filter on. */
  protected readonly filterVisible = computed(
    () => this.showFilter() && this.columns().some(column => this.isFilterable(column))
  );

  protected readonly emptyMessage = computed(() =>
    this.filter().trim() !== '' && this.rows().length > 0 ? this.noMatchText() : this.emptyText()
  );

  protected isSortable(column: TableColumn<T>): boolean {
    return column.sortable ?? Boolean(column.sortValue ?? column.value);
  }

  protected isFilterable(column: TableColumn<T>): boolean {
    return column.filterable ?? Boolean(column.value ?? column.sortValue);
  }

  protected columnClasses(column: TableColumn<T>): string {
    return [column.cssClass, this.isSortable(column) ? 'sortable' : ''].filter(Boolean).join(' ');
  }

  protected ariaSort(column: TableColumn<T>): 'ascending' | 'descending' | 'none' | null {
    if (!this.isSortable(column)) return null;
    if (this.sortKey() !== column.key) return 'none';

    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  protected sortIndicator(key: string): string {
    if (this.sortKey() !== key) return '';

    return this.sortDirection() === 'asc' ? ' ▲' : ' ▼';
  }

  /** Toggles the shared sort: the first click orders ascending, the next one flips it. */
  protected sortBy(column: TableColumn<T>): void {
    if (!this.isSortable(column)) return;

    if (this.sortKey() === column.key) {
      this.sortDirection.update(direction => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(column.key);
      this.sortDirection.set('asc');
    }

    this.sortChange.emit({ key: this.sortKey(), direction: this.sortDirection() });
  }

  protected onFilterInput(value: string): void {
    this.filter.set(value);
  }

  protected cellTemplate(key: string): TemplateRef<unknown> | null {
    return this.cellTemplates().find(template => template.appTableCell() === key)?.templateRef ?? null;
  }

  protected headerTemplate(key: string): TemplateRef<unknown> | null {
    return this.headerTemplates().find(template => template.appTableHeader() === key)?.templateRef ?? null;
  }

  private filterRows(rows: T[]): T[] {
    const term = this.filter().trim().toLowerCase();
    if (!term) return rows;

    const filterable = this.columns().filter(column => this.isFilterable(column));
    if (!filterable.length) return rows;

    return rows.filter(row => filterable.some(column => this.filterText(column, row).includes(term)));
  }

  private filterText(column: TableColumn<T>, row: T): string {
    const value = (column.value ?? column.sortValue)?.(row);
    if (value === null || value === undefined) return '';

    return (value instanceof Date ? value.toISOString() : String(value)).toLowerCase();
  }

  private sortRows(rows: T[]): T[] {
    const key = this.sortKey();
    if (!key) return rows;

    const column = this.columns().find(candidate => candidate.key === key);
    if (!column || !this.isSortable(column)) return rows;

    const read = column.sortValue ?? column.value;
    if (!read) return rows;

    const direction = this.sortDirection();

    return [...rows].sort((a, b) => compareValues(read(a), read(b), direction));
  }
}
