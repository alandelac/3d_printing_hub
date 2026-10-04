import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModelPrintCategory } from '../../../../domain/models/model-print-category.model';
import { ModelPrint } from '../../../../domain/models/model-print.model';
import { ModelFormModalComponent } from './model-form-modal.component';

const categories: ModelPrintCategory[] = [
  { id: 'c1', name: 'Functional' },
  { id: 'c2', name: 'Decor' }
];

const model: ModelPrint = {
  id: 'm1',
  name: 'Bracket',
  categoryId: 'c2',
  categoryName: 'Decor',
  estimatedWeightGrams: 42,
  estimatedTimeMinutes: 90,
  commercialLicense: true,
  defaultSalePrice: 8,
  defaultCost: 4,
  fileLocationOrUrl: 'https://files.example.com/bracket.stl',
  notes: 'Print with supports'
};

describe('ModelFormModalComponent', () => {
  let fixture: ComponentFixture<ModelFormModalComponent>;
  let component: ModelFormModalComponent;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const form = (): HTMLFormElement => compiled().querySelector('form') as HTMLFormElement;
  const submitButton = (): HTMLButtonElement =>
    compiled().querySelector('button[type="submit"]') as HTMLButtonElement;
  const inputNamed = (id: string): HTMLInputElement =>
    compiled().querySelector(`input#${id}`) as HTMLInputElement;

  const submit = (): void => {
    form().dispatchEvent(new Event('submit'));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ModelFormModalComponent] }).compileComponents();

    fixture = TestBed.createComponent(ModelFormModalComponent);
    component = fixture.componentInstance;
  });

  it('presents an empty create form with the first category preselected', () => {
    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();

    expect(compiled().querySelector('.modal-content h3')?.textContent).toBe('Create New Model');
    expect(inputNamed('modelName').value).toBe('');
    expect(compiled().querySelector<HTMLSelectElement>('select#modelCategory')?.value).toBe('c1');
    expect(inputNamed('modelWeight').value).toBe('0');
    expect(inputNamed('modelTime').value).toBe('0');
    expect(submitButton().textContent?.trim()).toBe('Create Model');
    expect(submitButton().disabled).toBe(false);
  });

  it('disables the create action while there are no categories', () => {
    fixture.detectChanges();

    const options = Array.from(compiled().querySelectorAll('select option')).map(option =>
      option.textContent?.trim()
    );

    expect(options).toContain('No categories available');
    expect(submitButton().disabled).toBe(true);
  });

  it('prefills the edit form and hides the category placeholders', () => {
    fixture.componentRef.setInput('categories', categories);
    fixture.componentRef.setInput('model', model);
    fixture.detectChanges();

    expect(compiled().querySelector('.modal-content h3')?.textContent).toBe('Edit Model');
    expect(inputNamed('editModelName').value).toBe('Bracket');
    expect(compiled().querySelector<HTMLSelectElement>('select#editModelCategory')?.value).toBe('c2');
    expect(inputNamed('editModelWeight').value).toBe('42');
    expect(inputNamed('editModelTime').value).toBe('90');
    expect(inputNamed('editModelFile').value).toBe('https://files.example.com/bracket.stl');
    expect(compiled().querySelector<HTMLTextAreaElement>('textarea#editModelNotes')?.value).toBe(
      'Print with supports'
    );
    expect(submitButton().textContent?.trim()).toBe('Save Changes');
  });

  it('emits the typed values on submit', () => {
    const save = vi.fn();
    component.save.subscribe(save);

    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();

    const name = inputNamed('modelName');
    name.value = 'Vase';
    name.dispatchEvent(new Event('input'));

    const weight = inputNamed('modelWeight');
    weight.value = '150';
    weight.dispatchEvent(new Event('input'));

    const time = inputNamed('modelTime');
    time.value = '45';
    time.dispatchEvent(new Event('input'));

    const category = compiled().querySelector('select#modelCategory') as HTMLSelectElement;
    category.value = 'c2';
    category.dispatchEvent(new Event('change'));

    const notes = compiled().querySelector('textarea#modelNotes') as HTMLTextAreaElement;
    notes.value = 'Draft';
    notes.dispatchEvent(new Event('input'));

    submit();

    expect(save).toHaveBeenCalledWith({
      name: 'Vase',
      categoryId: 'c2',
      estimatedWeightGrams: 150,
      estimatedTimeMinutes: 45,
      fileLocationOrUrl: '',
      notes: 'Draft'
    });
  });

  it('treats a cleared numeric input as null', () => {
    const save = vi.fn();
    component.save.subscribe(save);

    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();

    const weight = inputNamed('modelWeight');
    weight.value = '';
    weight.dispatchEvent(new Event('input'));

    submit();

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ estimatedWeightGrams: null, estimatedTimeMinutes: 0 })
    );
  });

  it('shows the creating and saving labels while loading', () => {
    fixture.componentRef.setInput('categories', categories);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(submitButton().textContent?.trim()).toBe('Creating...');
    expect(submitButton().disabled).toBe(true);

    fixture.componentRef.setInput('model', model);
    fixture.detectChanges();

    expect(submitButton().textContent?.trim()).toBe('Saving...');
  });

  it('emits cancel from the cancel button and from the modal shell', () => {
    const cancel = vi.fn();
    component.cancel.subscribe(cancel);

    fixture.detectChanges();

    compiled()
      .querySelector<HTMLButtonElement>('button.secondary')
      ?.dispatchEvent(new Event('click'));
    compiled().querySelector('.modal-backdrop')?.dispatchEvent(new Event('click'));

    expect(cancel).toHaveBeenCalledTimes(2);
  });
});
