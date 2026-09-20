import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Filament } from '../../../../domain/models/filament.model';
import { ModelPrint } from '../../../../domain/models/model-print.model';
import { ProductStock } from '../../../../domain/models/product-stock.model';
import { StockFormModalComponent } from './stock-form-modal.component';

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
  },
  {
    id: 'm2',
    name: 'Vase',
    categoryId: 'c1',
    categoryName: 'Decor',
    estimatedWeightGrams: 30,
    estimatedTimeMinutes: 60,
    commercialLicense: false,
    defaultSalePrice: 9,
    defaultCost: 4
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

const stock: ProductStock = {
  id: 's1',
  modelPrintId: 'm2',
  modelPrintName: 'Vase',
  filamentId: 'f1',
  filamentColorName: 'Black',
  filamentColorCode: '#000000',
  quantityInStock: 4,
  costToProduce: 2,
  recommendedSalePrice: 4,
  salePrice: 5,
  lastUpdated: '2026-01-02T00:00:00'
};

describe('StockFormModalComponent', () => {
  let fixture: ComponentFixture<StockFormModalComponent>;
  let component: StockFormModalComponent;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const inputs = (): HTMLInputElement[] =>
    Array.from(compiled().querySelectorAll<HTMLInputElement>('input'));
  const selects = (): HTMLSelectElement[] =>
    Array.from(compiled().querySelectorAll<HTMLSelectElement>('select'));
  const saveButton = (): HTMLButtonElement | undefined =>
    Array.from(compiled().querySelectorAll<HTMLButtonElement>('.modal-actions button')).find(button =>
      button.textContent?.includes('Add Product Stock') || button.textContent?.includes('Update')
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StockFormModalComponent] }).compileComponents();

    fixture = TestBed.createComponent(StockFormModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('models', models);
    fixture.componentRef.setInput('filaments', filaments);
  });

  it('starts a new product stock with the first model and filament selected', () => {
    fixture.detectChanges();

    expect(compiled().querySelector('.modal-content h3')?.textContent).toBe('Add New Product Stock');
    expect(selects()[0].value).toBe('m1');
    expect(selects()[1].value).toBe('f1');
    expect(inputs()[0].value).toBe('0');
    expect(inputs()[1].value).toBe('0');
    expect(compiled().textContent).toContain('Leave at 0 to automatically use the recommended sale price');
  });

  it('falls back to empty selects when no reference data is available', () => {
    fixture.componentRef.setInput('models', []);
    fixture.componentRef.setInput('filaments', []);
    fixture.detectChanges();

    expect(selects()[0].value).toBe('');
    expect(selects()[1].value).toBe('');
  });

  it('prefills the form and the title when editing an existing stock', () => {
    fixture.componentRef.setInput('stock', stock);
    fixture.detectChanges();

    expect(compiled().querySelector('.modal-content h3')?.textContent).toBe('Edit Product Stock');
    expect(selects()[0].value).toBe('m2');
    expect(selects()[1].value).toBe('f1');
    expect(inputs()[0].value).toBe('4');
    expect(inputs()[1].value).toBe('5');
    expect(saveButton()?.textContent?.trim()).toBe('Update');
  });

  it('emits the edited values on save', () => {
    const save = vi.fn();
    component.save.subscribe(save);

    fixture.componentRef.setInput('stock', stock);
    fixture.detectChanges();

    const modelSelect = selects()[0];
    modelSelect.value = 'm1';
    modelSelect.dispatchEvent(new Event('change'));

    const quantity = inputs()[0];
    quantity.value = '7';
    quantity.dispatchEvent(new Event('input'));

    const salePrice = inputs()[1];
    salePrice.value = '9.5';
    salePrice.dispatchEvent(new Event('input'));

    saveButton()?.click();

    expect(save).toHaveBeenCalledWith({
      modelPrintId: 'm1',
      filamentId: 'f1',
      quantityInStock: 7,
      salePrice: 9.5
    });
  });

  it('treats cleared numeric inputs as zero', () => {
    const save = vi.fn();
    component.save.subscribe(save);

    fixture.detectChanges();

    inputs().forEach(input => {
      input.value = '';
      input.dispatchEvent(new Event('input'));
    });

    saveButton()?.click();

    expect(save).toHaveBeenCalledWith({
      modelPrintId: 'm1',
      filamentId: 'f1',
      quantityInStock: 0,
      salePrice: 0
    });
  });

  it('disables the actions and shows the saving label while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const buttons = Array.from(compiled().querySelectorAll<HTMLButtonElement>('.modal-actions button'));

    expect(compiled().textContent).toContain('Saving...');
    expect(buttons.every(button => button.disabled)).toBe(true);
  });

  it('emits cancel from the cancel button and the modal shell', () => {
    const cancel = vi.fn();
    component.cancel.subscribe(cancel);

    fixture.detectChanges();

    Array.from(compiled().querySelectorAll<HTMLButtonElement>('.modal-actions button'))
      .find(button => button.textContent === 'Cancel')
      ?.click();
    compiled().querySelector('.modal-backdrop')?.dispatchEvent(new Event('click'));

    expect(cancel).toHaveBeenCalledTimes(2);
  });
});
