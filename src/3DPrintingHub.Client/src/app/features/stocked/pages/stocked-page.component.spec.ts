import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { ModelRepository } from '../../../data/repositories/model.repository';
import { ProductStockRepository } from '../../../data/repositories/product-stock.repository';
import { Filament } from '../../../domain/models/filament.model';
import { ModelPrint } from '../../../domain/models/model-print.model';
import { ProductStock } from '../../../domain/models/product-stock.model';
import { StockedPageComponent } from './stocked-page.component';

const models: ModelPrint[] = [
  {
    id: 'm1',
    name: 'Bracket',
    categoryId: 'c1',
    categoryName: 'Functional',
    estimatedWeightGrams: 10,
    estimatedTimeMinutes: 20,
    commercialLicense: false,
    defaultSalePrice: 5,
    defaultCost: 2.5
  }
];

const filaments: Filament[] = [
  {
    id: 'f1',
    filamentProfileId: 'p1',
    filamentProfile: {
      id: 'p1',
      brandId: 'b1',
      brandName: 'Acme',
      materialTypeId: 't1',
      materialTypeName: 'PLA'
    },
    filamentColorId: 'col1',
    colorName: 'Black',
    colorCode: '#000000',
    remainingWeightGrams: 500,
    minCost: 10,
    maxCost: 20,
    lastCost: 15,
    lastPurchaseDate: '2026-01-01T00:00:00'
  }
];

const stock = (id: string, quantity: number, minimumInventoryQuantity = 2): ProductStock => ({
  id,
  modelPrintId: 'm1',
  modelPrintName: 'Bracket',
  filamentId: 'f1',
  filamentColorName: 'Black',
  filamentColorCode: '#000000',
  filamentMaterialTypeName: 'PLA',
  quantityInStock: quantity,
  minimumInventoryQuantity,
  costToProduce: 2.123456,
  recommendedSalePrice: 4.987654,
  salePrice: 5,
  lastUpdated: '2026-01-02T00:00:00'
});

describe('StockedPageComponent', () => {
  let fixture: ComponentFixture<StockedPageComponent>;
  let getAllProductStocks: ReturnType<typeof vi.fn>;
  let createProductStock: ReturnType<typeof vi.fn>;
  let updateProductStock: ReturnType<typeof vi.fn>;
  let deleteProductStock: ReturnType<typeof vi.fn>;
  let adjustProductStockQuantity: ReturnType<typeof vi.fn>;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const rows = (): HTMLTableRowElement[] =>
    Array.from(compiled().querySelectorAll<HTMLTableRowElement>('tbody tr'));
  const modal = (): HTMLElement | null =>
    compiled().querySelector('app-stock-form-modal') as HTMLElement | null;
  const flush = async (): Promise<void> => {
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const buttonWithText = (root: HTMLElement, text: string): HTMLButtonElement | undefined =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
      button => button.textContent?.trim() === text
    );

  beforeEach(async () => {
    getAllProductStocks = vi.fn().mockReturnValue(of([stock('s1', 4)]));
    createProductStock = vi.fn().mockReturnValue(of({ id: 's2' }));
    updateProductStock = vi.fn().mockReturnValue(of(stock('s1', 4)));
    deleteProductStock = vi.fn().mockReturnValue(of(undefined));
    adjustProductStockQuantity = vi.fn().mockReturnValue(of(stock('s1', 6)));
    vi.stubGlobal('alert', vi.fn());

    await TestBed.configureTestingModule({
      imports: [StockedPageComponent],
      providers: [
        {
          provide: ProductStockRepository,
          useValue: {
            getAllProductStocks,
            createProductStock,
            updateProductStock,
            deleteProductStock,
            adjustProductStockQuantity
          }
        },
        {
          provide: ModelRepository,
          useValue: { getAllModelPrints: vi.fn().mockReturnValue(of(models)) }
        },
        {
          provide: FilamentRepository,
          useValue: { getFilaments: vi.fn().mockReturnValue(of(filaments)) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StockedPageComponent);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads the product stock into the shared table', async () => {
    fixture.detectChanges();
    await flush();

    const headers = Array.from(compiled().querySelectorAll('thead th')).map(header =>
      header.textContent?.trim()
    );

    expect(compiled().querySelector('app-table table')).not.toBeNull();
    expect(headers).toEqual([
      'ID',
      'Model',
      'Filament',
      'Quantity',
      'Cost To Produce',
      'Recommended Sale Price',
      'Sale Price',
      'Last Updated',
      'Actions'
    ]);
    expect(rows().length).toBe(1);
    expect(rows()[0].textContent).toContain('Bracket');
    expect(rows()[0].textContent).toContain('Black - PLA');
    expect(rows()[0].querySelector('.swatch')).not.toBeNull();
    expect(rows()[0].querySelector('.qty-display')?.textContent).toBe('4');
    expect(rows()[0].querySelector('.stock-status')).toBeNull();
    expect(rows()[0].cells[4].textContent?.trim()).toBe('2.12');
    expect(rows()[0].cells[5].textContent?.trim()).toBe('4.99');
  });

  it('marks zero red, positive quantities below minimum yellow, and the threshold normal', async () => {
    getAllProductStocks.mockReturnValue(of([
      stock('out', 0, 2),
      stock('low', 1, 2),
      stock('at-minimum', 2, 2),
      stock('above-minimum', 3, 2)
    ]));

    fixture.detectChanges();
    await flush();

    const quantities = Array.from(compiled().querySelectorAll<HTMLElement>('.qty-display'));
    const statuses = Array.from(compiled().querySelectorAll<HTMLElement>('.stock-status'));

    expect(quantities.find(element => element.textContent?.trim() === '0')?.classList.contains('qty-display--out-of-stock')).toBe(true);
    expect(quantities.find(element => element.textContent?.trim() === '1')?.classList.contains('qty-display--low-stock')).toBe(true);
    expect(quantities.find(element => element.textContent?.trim() === '2')?.classList.contains('qty-display--low-stock')).toBe(false);
    expect(statuses.map(element => element.textContent?.trim()).sort()).toEqual(['Low stock', 'Out of stock']);
    expect(quantities.find(element => element.textContent?.trim() === '1')?.getAttribute('aria-label'))
      .toContain('Low stock');
  });

  it('shows the empty state when there is no product stock', async () => {
    getAllProductStocks.mockReturnValue(of([]));

    fixture.detectChanges();
    await flush();

    expect(compiled().textContent).toContain('No product stock found.');
    expect(compiled().querySelector('table')).toBeNull();
  });

  it('creates a product stock from the modal', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Add New Product Stock')?.click();
    await flush();

    expect(modal()).not.toBeNull();

    buttonWithText(modal()!, 'Add Product Stock')?.click();
    await flush();

    expect(createProductStock).toHaveBeenCalledWith({
      modelPrintId: 'm1',
      filamentId: 'f1',
      quantityInStock: 0,
      salePrice: 0
    });
    expect(modal()).toBeNull();
    expect(alert).toHaveBeenCalledWith('Product stock created successfully!');
  });

  it('rejects a product stock without a model or filament selected', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Add New Product Stock')?.click();
    await flush();

    const selects = Array.from(modal()!.querySelectorAll<HTMLSelectElement>('select'));
    selects[0].value = '';
    selects[0].dispatchEvent(new Event('change'));

    buttonWithText(modal()!, 'Add Product Stock')?.click();
    await flush();

    expect(alert).toHaveBeenCalledWith('Please select a model and a filament.');
    expect(createProductStock).not.toHaveBeenCalled();
  });

  it('edits an existing product stock', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(rows()[0], 'Edit')?.click();
    await flush();

    expect(modal()?.querySelector('.modal-content h3')?.textContent).toBe('Edit Product Stock');

    buttonWithText(modal()!, 'Update')?.click();
    await flush();

    expect(updateProductStock).toHaveBeenCalledWith({
      id: 's1',
      modelPrintId: 'm1',
      filamentId: 'f1',
      quantityInStock: 4,
      salePrice: 5,
      minimumInventoryQuantity: 2
    });
    expect(alert).toHaveBeenCalledWith('Product stock updated successfully!');
  });

  it('rejects a fractional minimum before calling the API', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(rows()[0], 'Edit')?.click();
    await flush();

    const minimumInput = modal()!.querySelectorAll<HTMLInputElement>('input')[1];
    minimumInput.value = '1.5';
    minimumInput.dispatchEvent(new Event('input'));
    buttonWithText(modal()!, 'Update')?.click();
    await flush();

    expect(alert).toHaveBeenCalledWith('Minimum inventory quantity must be a non-negative integer.');
    expect(updateProductStock).not.toHaveBeenCalled();
  });

  it('reports an API error when updating a minimum quantity', async () => {
    updateProductStock.mockReturnValue(throwError(() => new Error('offline')));

    fixture.detectChanges();
    await flush();

    buttonWithText(rows()[0], 'Edit')?.click();
    await flush();
    buttonWithText(modal()!, 'Update')?.click();
    await flush();

    expect(updateProductStock).toHaveBeenCalledWith(expect.objectContaining({
      id: 's1',
      minimumInventoryQuantity: 2
    }));
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Error:'));
    expect(modal()).not.toBeNull();
  });

  it('reports a failed save', async () => {
    createProductStock.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Add New Product Stock')?.click();
    await flush();
    buttonWithText(modal()!, 'Add Product Stock')?.click();
    await flush();

    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Error'));
  });

  it('deletes a product stock after the confirmation', async () => {
    fixture.detectChanges();
    await flush();

    rows()[0].querySelector<HTMLButtonElement>('button.danger')?.click();
    await flush();

    expect(compiled().textContent).toContain('Bracket / Black');

    buttonWithText(compiled(), 'Yes, Delete')?.click();
    await flush();

    expect(deleteProductStock).toHaveBeenCalledWith('s1');
    expect(compiled().querySelector('app-confirm-delete')).toBeNull();
  });

  it('reports a failed delete and keeps the session usable', async () => {
    deleteProductStock.mockReturnValue(throwError(() => new Error('nope')));

    fixture.detectChanges();
    await flush();

    rows()[0].querySelector<HTMLButtonElement>('button.danger')?.click();
    await flush();
    buttonWithText(compiled(), 'Yes, Delete')?.click();
    await flush();

    expect(alert).toHaveBeenCalled();
  });

  it('cancels the delete confirmation', async () => {
    fixture.detectChanges();
    await flush();

    rows()[0].querySelector<HTMLButtonElement>('button.danger')?.click();
    await flush();
    buttonWithText(compiled(), 'Cancel')?.click();
    await flush();

    expect(deleteProductStock).not.toHaveBeenCalled();
    expect(compiled().querySelector('app-confirm-delete')).toBeNull();
  });

  it('adds and subtracts quantity from a row', async () => {
    fixture.detectChanges();
    await flush();

    const qtyInput = rows()[0].querySelector<HTMLInputElement>('.qty-adjust input')!;
    qtyInput.value = '5';
    qtyInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    buttonWithText(rows()[0], '+')?.click();
    await flush();

    expect(adjustProductStockQuantity).toHaveBeenCalledWith({ productStockId: 's1', quantity: 5 });

    qtyInput.value = '3';
    qtyInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    buttonWithText(rows()[0], '\u2212')?.click();
    await flush();

    expect(adjustProductStockQuantity).toHaveBeenLastCalledWith({ productStockId: 's1', quantity: -3 });
  });

  it('refuses a quantity adjustment without a positive amount', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(rows()[0], '+')?.click();
    await flush();

    expect(alert).toHaveBeenCalledWith('Please enter a valid quantity greater than 0.');
    expect(adjustProductStockQuantity).not.toHaveBeenCalled();
  });

  it('reports a failed quantity adjustment', async () => {
    adjustProductStockQuantity.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    await flush();

    const qtyInput = rows()[0].querySelector<HTMLInputElement>('.qty-adjust input')!;
    qtyInput.value = '2';
    qtyInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    buttonWithText(rows()[0], '+')?.click();
    await flush();

    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Error'));
  });

  it('keeps the page usable when the reference data or the list fails to load', async () => {
    getAllProductStocks.mockReturnValue(throwError(() => new Error('offline')));

    fixture.detectChanges();
    await flush();

    expect(compiled().querySelector('table')).toBeNull();
    expect(compiled().textContent).toContain('No product stock found.');
  });
});
