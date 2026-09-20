import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableCellDirective, TableColumn, TableComponent, TableHeaderDirective } from './table.component';

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
});
