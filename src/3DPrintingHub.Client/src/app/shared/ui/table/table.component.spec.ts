import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableHeaderDirective,
  TableSortState
} from './table.component';

interface Row {
  id: string;
  name: string;
  quantity: number;
}

const row = (id: string, name: string, quantity: number): Row => ({ id, name, quantity });

@Component({
  standalone: true,
  imports: [TableComponent],
  template: `
    <app-table
      [columns]="columns"
      [rows]="rows"
      [loading]="loading"
      [showFilter]="showFilter"
      [showActions]="showActions"
      emptyText="No records found."
      (edit)="edited = $event"
      (delete)="deleted = $event"
    />
  `,
})
class PlainHostComponent {
  columns: TableColumn<Row>[] = [
    { key: 'name', header: 'Name', cssClass: 'col-name', value: (item: Row) => item.name },
    { key: 'quantity', header: 'Quantity', value: (item: Row) => item.quantity },
    { key: 'notes', header: 'Notes' },
  ];
  rows: Row[] = [];
  loading = false;
  showFilter = true;
  showActions = true;
  edited: Row | null = null;
  deleted: Row | null = null;
}

@Component({
  standalone: true,
  imports: [TableComponent, TableCellDirective, TableHeaderDirective],
  template: `
    <app-table [columns]="columns" [rows]="rows">
      <ng-template appTableHeader="name" let-column>
        <th class="sortable">{{ column.header }} ▲</th>
      </ng-template>
      <ng-template appTableCell="name" let-item>
        <strong class="custom-cell">{{ item.name }}</strong>
      </ng-template>
    </app-table>
  `,
})
class TemplatedHostComponent {
  columns: TableColumn<Row>[] = [
    { key: 'name', header: 'Name' },
    { key: 'quantity', header: 'Quantity', value: (item: Row) => item.quantity },
  ];
  rows: Row[] = [row('1', 'Alpha', 7)];
}

@Component({
  standalone: true,
  imports: [TableComponent],
  template: `
    <app-table
      [columns]="columns"
      [rows]="rows"
      [loading]="loading"
      [showFilter]="showFilter"
      emptyText="No records found."
      noMatchText="No records match."
      filterPlaceholder="Filter records…"
      [(filter)]="filter"
      (sortChange)="sorted = $event"
    />
  `
})
class SortableHostComponent {
  columns: TableColumn<Row>[] = [
    { key: 'name', header: 'Name', value: (item: Row) => item.name },
    { key: 'quantity', header: 'Quantity', value: (item: Row) => item.quantity },
    { key: 'code', header: 'Code', value: (item: Row) => item.id, sortable: false }
  ];
  rows: Row[] = [row('b', 'Beta', 5), row('a', 'Alpha', 20), row('c', 'Gamma', 1)];
  loading = false;
  showFilter = true;
  filter = '';
  sorted: TableSortState | null = null;
}

@Component({
  standalone: true,
  imports: [TableComponent],
  template: `<app-table [columns]="columns" [rows]="rows" [showFilter]="false" />`
})
class FilterDisabledHostComponent {
  columns: TableColumn<Row>[] = [
    { key: 'name', header: 'Name', value: (item: Row) => item.name }
  ];
  rows: Row[] = [row('1', 'Alpha', 7)];
}

describe('TableComponent', () => {
  describe('with columns and rows only', () => {
    let fixture: ComponentFixture<PlainHostComponent>;
    let host: PlainHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [PlainHostComponent] }).compileComponents();

      fixture = TestBed.createComponent(PlainHostComponent);
      host = fixture.componentInstance;
    });

    it('renders the configured headers in order and the trailing actions column', () => {
      host.rows = [row('1', 'Alpha', 7)];
      fixture.detectChanges();

      const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th') as NodeListOf<HTMLElement>).map(
        header => header.textContent?.trim()
      );

      expect(headers).toEqual(['Name', 'Quantity', 'Notes', 'Actions']);
    });

    it('renders the default cell values and applies the column class', () => {
      host.rows = [row('1', 'Alpha', 7)];
      fixture.detectChanges();

      const header = fixture.nativeElement.querySelector('thead th') as HTMLElement;
      const firstCell = fixture.nativeElement.querySelector('tbody td') as HTMLElement;
      const cells = Array.from(
        fixture.nativeElement.querySelectorAll('tbody td') as NodeListOf<HTMLElement>
      ).map(cell => cell.textContent?.trim());

      expect(header.classList.contains('col-name')).toBe(true);
      expect(firstCell.classList.contains('col-name')).toBe(true);
      expect(cells.slice(0, 3)).toEqual(['Alpha', '7', '']);
    });

    it('renders no actions column when disabled', () => {
      host.showActions = false;
      host.rows = [row('1', 'Alpha', 7)];
      fixture.detectChanges();

      const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th') as NodeListOf<HTMLElement>).map(
        header => header.textContent?.trim()
      );

      expect(headers).toEqual(['Name', 'Quantity', 'Notes']);
      expect(fixture.nativeElement.querySelector('app-table-actions')).toBeNull();
    });

    it('shows the loading state instead of the table', () => {
      host.loading = true;
      host.rows = [row('1', 'Alpha', 7)];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.textContent).toContain('Loading...');
      expect(compiled.querySelector('table')).toBeNull();
    });

    it('shows the empty message when there are no rows', () => {
      host.rows = [];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.textContent).toContain('No records found.');
      expect(compiled.querySelector('table')).toBeNull();
    });

    it('emits edit and delete with the row that was clicked', () => {
      const first = row('1', 'Alpha', 7);
      const second = row('2', 'Beta', 3);
      host.rows = [first, second];
      fixture.detectChanges();

      const secondRow = fixture.nativeElement.querySelectorAll('tbody tr')[1] as HTMLElement;

      secondRow.querySelector<HTMLButtonElement>('button.secondary')?.click();
      secondRow.querySelector<HTMLButtonElement>('button.danger')?.click();

      expect(host.edited).toBe(second);
      expect(host.deleted).toBe(second);
    });
  });

  describe('with custom cell and header templates', () => {
    let fixture: ComponentFixture<TemplatedHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [TemplatedHostComponent] }).compileComponents();

      fixture = TestBed.createComponent(TemplatedHostComponent);
      fixture.detectChanges();
    });

    it('renders the custom cell template for the configured column', () => {
      const customCell = fixture.nativeElement.querySelector('tbody .custom-cell') as HTMLElement;

      expect(customCell?.textContent).toBe('Alpha');
      expect(fixture.nativeElement.querySelector('tbody td:nth-child(2)')?.textContent?.trim()).toBe('7');
    });

    it('renders the custom header template for the configured column', () => {
      const sortableHeader = fixture.nativeElement.querySelector('thead th.sortable') as HTMLElement;

      expect(sortableHeader.textContent?.trim()).toBe('Name ▲');
    });
  });

  describe('with the shared sorting and filtering', () => {
    let fixture: ComponentFixture<SortableHostComponent>;
    let host: SortableHostComponent;

    const headers = (): HTMLTableCellElement[] =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLTableCellElement>('thead th'));
    const headerWithText = (text: string): HTMLTableCellElement =>
      headers().find(header => header.textContent?.trim().startsWith(text))!;
    const bodyRows = (): HTMLTableRowElement[] =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLTableRowElement>('tbody tr'));
    const firstColumn = (): string[] =>
      bodyRows().map(row => row.querySelector('td')?.textContent?.trim() ?? '');
    const filterInput = (): HTMLInputElement =>
      fixture.nativeElement.querySelector('input.filter-input') as HTMLInputElement;
    const type = (term: string): void => {
      const input = filterInput();
      input.value = term;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [SortableHostComponent] }).compileComponents();

      fixture = TestBed.createComponent(SortableHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('renders the shared filter bar with the configured placeholder', () => {
      expect(filterInput().placeholder).toBe('Filter records…');
    });

    it('keeps the source order until a header is clicked', () => {
      expect(firstColumn()).toEqual(['Beta', 'Alpha', 'Gamma']);
      expect(headers().map(header => header.textContent?.trim())).toEqual(['Name', 'Quantity', 'Code', 'Actions']);
    });

    it('filters the rows across every filterable column', () => {
      type('gam');

      expect(firstColumn()).toEqual(['Gamma']);

      type('20');

      expect(firstColumn()).toEqual(['Alpha']);
    });

    it('mirrors the filter term through the two-way binding', () => {
      type('alpha');

      expect(host.filter).toBe('alpha');
    });

    it('shows the no-match message when nothing matches and clears it afterwards', () => {
      type('nothing-like-this');

      const compiled = fixture.nativeElement as HTMLElement;

      expect(bodyRows().length).toBe(0);
      expect(compiled.textContent).toContain('No records match.');
      expect(compiled.querySelector('table')).toBeNull();

      type('');

      expect(firstColumn()).toEqual(['Beta', 'Alpha', 'Gamma']);
    });

    it('orders string columns through the shared header and flips on the second click', () => {
      headerWithText('Name').click();
      fixture.detectChanges();

      expect(firstColumn()).toEqual(['Alpha', 'Beta', 'Gamma']);
      expect(headerWithText('Name').textContent?.trim()).toBe('Name ▲');
      expect(host.sorted).toEqual({ key: 'name', direction: 'asc' });

      headerWithText('Name').click();
      fixture.detectChanges();

      expect(firstColumn()).toEqual(['Gamma', 'Beta', 'Alpha']);
      expect(headerWithText('Name').textContent?.trim()).toBe('Name ▼');
      expect(host.sorted).toEqual({ key: 'name', direction: 'desc' });
    });

    it('orders numeric columns by value and moves the sort to another column', () => {
      headerWithText('Quantity').click();
      fixture.detectChanges();

      expect(firstColumn()).toEqual(['Gamma', 'Beta', 'Alpha']);
      expect(headerWithText('Quantity').textContent?.trim()).toBe('Quantity ▲');

      headerWithText('Name').click();
      fixture.detectChanges();

      expect(firstColumn()).toEqual(['Alpha', 'Beta', 'Gamma']);
      expect(headerWithText('Quantity').textContent?.trim()).toBe('Quantity');
    });

    it('exposes the sort state to assistive technology', () => {
      headerWithText('Name').click();
      fixture.detectChanges();

      expect(headerWithText('Name').getAttribute('aria-sort')).toBe('ascending');
      expect(headerWithText('Quantity').getAttribute('aria-sort')).toBe('none');
      expect(headerWithText('Code').getAttribute('aria-sort')).toBeNull();
    });

    it('leaves columns marked as not sortable out of the shared ordering', () => {
      const codeHeader = headerWithText('Code');

      expect(codeHeader.classList.contains('sortable')).toBe(false);

      codeHeader.click();
      fixture.detectChanges();

      expect(firstColumn()).toEqual(['Beta', 'Alpha', 'Gamma']);
      expect(host.sorted).toBeNull();
    });

    it('hides the filter bar when the page opts out', () => {
      const optOutFixture = TestBed.createComponent(FilterDisabledHostComponent);
      optOutFixture.detectChanges();

      expect(optOutFixture.nativeElement.querySelector('input.filter-input')).toBeNull();
    });
  });
});
