import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Filament } from '../../../domain/models/filament.model';
import { ModelPrint } from '../../../domain/models/model-print.model';
import { PrintJobFormComponent } from './print-job-form.component';

const models: ModelPrint[] = [{
  id: 'm1',
  name: 'Bracket',
  categoryId: 'c1',
  categoryName: 'Functional',
  estimatedWeightGrams: 42,
  estimatedTimeMinutes: 60,
  commercialLicense: false,
  defaultSalePrice: 10,
  defaultCost: 5
}];

const filaments: Filament[] = [{
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
}];

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
    const filamentOption = compiled().querySelectorAll('select')[1].querySelector('option[value="f1"]');

    expect(filamentOption?.textContent?.trim()).toBe('SUNLU PETG - Black (300g left)');
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