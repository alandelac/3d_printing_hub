import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Filament } from '../../../domain/models/filament.model';
import { ModelPrint } from '../../../domain/models/model-print.model';
import { PrintJobFormComponent } from './print-job-form.component';

const models: ModelPrint[] = [
  {
    id: 'm1',
    name: 'Bracket',
    categoryId: 'c1',
    categoryName: 'Functional',
    estimatedWeightGrams: 42,
    estimatedTimeMinutes: 60,
    commercialLicense: false,
    defaultSalePrice: 10,
    defaultCost: 5
  },
  {
    id: 'm2',
    name: 'Vase',
    categoryId: 'c2',
    categoryName: 'Decorative',
    estimatedWeightGrams: 80,
    estimatedTimeMinutes: 120,
    commercialLicense: false,
    defaultSalePrice: 20,
    defaultCost: 8
  }
];

const filaments: Filament[] = [
  {
    id: 'f1',
    filamentProfileId: 'fp1',
    filamentProfile: {
      id: 'fp1',
      brandId: 'b1',
      brandName: 'SUNLU',
      materialTypeId: 'mt1',
      materialTypeName: 'PETG'
    },
    filamentColorId: 'c1',
    colorName: 'Black',
    colorCode: '#000000',
    remainingWeightGrams: 300,
    minCost: 0,
    maxCost: 0,
    lastCost: 0,
    lastPurchaseDate: ''
  },
  {
    id: 'f2',
    filamentProfileId: 'fp2',
    filamentProfile: {
      id: 'fp2',
      brandId: 'b2',
      brandName: 'Polymaker',
      materialTypeId: 'mt2',
      materialTypeName: 'PLA'
    },
    filamentColorId: 'c2',
    colorName: 'Blue',
    colorCode: '#0000ff',
    remainingWeightGrams: 500,
    minCost: 0,
    maxCost: 0,
    lastCost: 0,
    lastPurchaseDate: ''
  }
];

describe('PrintJobFormComponent', () => {
  let fixture: ComponentFixture<PrintJobFormComponent>;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PrintJobFormComponent] }).compileComponents();
    fixture = TestBed.createComponent(PrintJobFormComponent);
    fixture.componentRef.setInput('models', models);
    fixture.componentRef.setInput('filaments', filaments);
    fixture.detectChanges();
  });

  it('shows filament brand, material, color, and remaining weight in the selector', () => {
    const filamentOption = compiled().querySelector('#filamentId option[value="f1"]');

    expect(filamentOption?.textContent?.trim()).toBe('SUNLU PETG - Black (300g left)');
  });

  it('filters models by name without regard to case', () => {
    const search = compiled().querySelector<HTMLInputElement>('#modelSearch')!;
    search.value = 'vAs';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const options = compiled().querySelectorAll<HTMLOptionElement>('#modelPrintId option');

    expect(Array.from(options).map(option => option.value)).toEqual(['', 'm2']);

    search.value = '';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(compiled().querySelector<HTMLSelectElement>('#modelPrintId')?.value).toBe('m1');
  });

  it('filters filaments by brand, material, or color without regard to case', () => {
    const search = compiled().querySelector<HTMLInputElement>('#filamentSearch')!;
    for (const searchTerm of ['polymaker', 'pla', 'blue']) {
      search.value = searchTerm;
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const options = compiled().querySelectorAll<HTMLOptionElement>('#filamentId option');
      expect(Array.from(options).map(option => option.value)).toEqual(['', 'f2']);
    }
  });

  it('calculates used weight from model weight and produced quantity', () => {
    const quantity = compiled().querySelector<HTMLInputElement>('#producedQuantity')!;
    const weight = compiled().querySelector<HTMLInputElement>('#usedWeightGrams')!;

    quantity.value = '3';
    quantity.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(weight.value).toBe('126');
  });

  it('prevents native form submission and emits the calculated weight', () => {
    const save = vi.fn();
    fixture.componentInstance.save.subscribe(save);

    const quantity = compiled().querySelector<HTMLInputElement>('#producedQuantity')!;
    quantity.value = '2';
    quantity.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const event = new Event('submit', { bubbles: true, cancelable: true });
    compiled().querySelector('form')!.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({
      modelPrintId: 'm1',
      producedQuantity: 2,
      usedWeightGrams: 84
    }));
  });
});