import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ModelRepository } from '../../../data/repositories/model.repository';
import { ModelPrintCategory } from '../../../domain/models/model-print-category.model';
import { ModelPrint } from '../../../domain/models/model-print.model';
import { ModelsPageComponent } from './models-page.component';

const categories: ModelPrintCategory[] = [
  { id: 'c1', name: 'Functional' },
  { id: 'c2', name: 'Decor' }
];

const model = (id: string, name: string, cost: number): ModelPrint => ({
  id,
  name,
  categoryId: 'c1',
  categoryName: 'Functional',
  estimatedWeightGrams: 50,
  estimatedTimeMinutes: 60,
  commercialLicense: false,
  defaultSalePrice: cost * 2,
  defaultCost: cost,
  fileLocationOrUrl: '',
  notes: ''
});

describe('ModelsPageComponent', () => {
  let fixture: ComponentFixture<ModelsPageComponent>;
  let getCategories: ReturnType<typeof vi.fn>;
  let createCategory: ReturnType<typeof vi.fn>;
  let updateCategory: ReturnType<typeof vi.fn>;
  let deleteCategory: ReturnType<typeof vi.fn>;
  let getAllModelPrints: ReturnType<typeof vi.fn>;
  let createModelPrint: ReturnType<typeof vi.fn>;
  let updateModelPrint: ReturnType<typeof vi.fn>;
  let deleteModelPrint: ReturnType<typeof vi.fn>;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const modelRows = (): HTMLTableRowElement[] =>
    Array.from(compiled().querySelectorAll<HTMLTableRowElement>('app-table tbody tr'));
  const modal = (selector: string): HTMLElement | null =>
    compiled().querySelector(selector) as HTMLElement | null;
  const buttonWithText = (root: HTMLElement, text: string): HTMLButtonElement | undefined =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
      button => button.textContent?.trim() === text
    );
  const flush = async (): Promise<void> => {
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    getCategories = vi.fn().mockReturnValue(of(categories));
    createCategory = vi.fn().mockReturnValue(of({ id: 'c3' }));
    updateCategory = vi.fn().mockReturnValue(of({ id: 'c1' }));
    deleteCategory = vi.fn().mockReturnValue(of(undefined));
    getAllModelPrints = vi.fn().mockReturnValue(of([model('m1', 'Bracket', 2.5), model('m2', 'Vase', 4)]));
    createModelPrint = vi.fn().mockReturnValue(of(model('m3', 'Lamp', 1)));
    updateModelPrint = vi.fn().mockReturnValue(of(model('m1', 'Bracket', 2.5)));
    deleteModelPrint = vi.fn().mockReturnValue(of(undefined));
    vi.stubGlobal('alert', vi.fn());
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'table').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [ModelsPageComponent],
      providers: [
        {
          provide: ModelRepository,
          useValue: {
            getCategories,
            createCategory,
            updateCategory,
            deleteCategory,
            getAllModelPrints,
            createModelPrint,
            updateModelPrint,
            deleteModelPrint
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModelsPageComponent);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loads the models and renders them through the shared table', async () => {
    fixture.detectChanges();
    await flush();

    const headers = Array.from(compiled().querySelectorAll('thead th')).map(header =>
      header.textContent?.trim()
    );

    expect(compiled().querySelector('app-table table')).not.toBeNull();
    expect(headers).toEqual(['Name', 'Category', 'Weight (g)', 'Time (min)', 'Default Cost', 'Sale Price', 'Actions']);
    expect(modelRows().length).toBe(2);
    expect(modelRows()[0].textContent).toContain('Bracket');
    expect(modelRows()[0].textContent).toContain('2.50');
  });

  it('filters the rows through the shared filter input', async () => {
    fixture.detectChanges();
    await flush();

    const filter = compiled().querySelector('input.filter-input') as HTMLInputElement;
    filter.value = 'vase';
    filter.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(modelRows().length).toBe(1);
    expect(modelRows()[0].textContent).toContain('Vase');
  });

  it('falls back to the shared no-match message when the filter matches nothing', async () => {
    fixture.detectChanges();
    await flush();

    const filter = compiled().querySelector('input.filter-input') as HTMLInputElement;
    filter.value = 'nothing-like-this';
    filter.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(modelRows().length).toBe(0);
    expect(compiled().textContent).toContain('No results match the current filter.');
  });

  it('sorts the rows from the sortable headers', async () => {
    fixture.detectChanges();
    await flush();

    const nameHeader = compiled().querySelector('th.sortable') as HTMLTableCellElement;
    nameHeader.click();
    fixture.detectChanges();

    expect(modelRows()[0].textContent).toContain('Bracket');
    expect(nameHeader.textContent?.trim()).toBe('Name ▲');

    nameHeader.click();
    fixture.detectChanges();

    expect(modelRows()[0].textContent).toContain('Vase');
    expect(nameHeader.textContent?.trim()).toBe('Name ▼');
  });

  it('shows the empty state when there are no models', async () => {
    getAllModelPrints.mockReturnValue(of([]));

    fixture.detectChanges();
    await flush();

    expect(compiled().textContent).toContain('No models found. Create your first model above.');
    expect(compiled().querySelector('table')).toBeNull();
  });

  it('creates a model from the create modal', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'New Model')?.click();
    await flush();

    const createModal = modal('app-model-form-modal')!;

    expect(createModal.querySelector('.modal-content h3')?.textContent).toBe('Create New Model');

    const name = createModal.querySelector('input#modelName') as HTMLInputElement;
    name.value = 'Lamp';
    name.dispatchEvent(new Event('input'));

    const weight = createModal.querySelector('input#modelWeight') as HTMLInputElement;
    weight.value = '120';
    weight.dispatchEvent(new Event('input'));

    const time = createModal.querySelector('input#modelTime') as HTMLInputElement;
    time.value = '30';
    time.dispatchEvent(new Event('input'));

    createModal.querySelector('form')?.dispatchEvent(new Event('submit'));
    await flush();

    expect(createModelPrint).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Lamp', categoryId: 'c1', estimatedWeightGrams: 120, estimatedTimeMinutes: 30 })
    );
    expect(alert).toHaveBeenCalledWith('Model created successfully!');
    expect(modal('app-model-form-modal')).toBeNull();
  });

  it('reports the validation errors of an invalid model', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'New Model')?.click();
    await flush();

    const createModal = modal('app-model-form-modal')!;
    const name = createModal.querySelector('input#modelName') as HTMLInputElement;
    name.value = '';
    name.dispatchEvent(new Event('input'));

    createModal.querySelector('form')?.dispatchEvent(new Event('submit'));
    await flush();

    expect(createModelPrint).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Validation Error'));
    expect(modal('app-model-form-modal')).not.toBeNull();
  });

  it('reports a failed creation', async () => {
    createModelPrint.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'New Model')?.click();
    await flush();

    const createModal = modal('app-model-form-modal')!;
    const name = createModal.querySelector('input#modelName') as HTMLInputElement;
    name.value = 'Lamp';
    name.dispatchEvent(new Event('input'));
    const weight = createModal.querySelector('input#modelWeight') as HTMLInputElement;
    weight.value = '10';
    weight.dispatchEvent(new Event('input'));
    const time = createModal.querySelector('input#modelTime') as HTMLInputElement;
    time.value = '10';
    time.dispatchEvent(new Event('input'));

    createModal.querySelector('form')?.dispatchEvent(new Event('submit'));
    await flush();

    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Error'));
  });

  it('edits a model from the row actions', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(modelRows()[0], 'Edit')?.click();
    await flush();

    const editModal = modal('app-model-form-modal')!;

    expect(editModal.querySelector('.modal-content h3')?.textContent).toBe('Edit Model');

    const name = editModal.querySelector('input#editModelName') as HTMLInputElement;
    expect(name.value).toBe('Bracket');

    name.value = 'Bracket v2';
    name.dispatchEvent(new Event('input'));

    editModal.querySelector('form')?.dispatchEvent(new Event('submit'));
    await flush();

    expect(updateModelPrint).toHaveBeenCalledWith(expect.objectContaining({ id: 'm1', name: 'Bracket v2' }));
    expect(alert).toHaveBeenCalledWith('Model updated successfully!');
  });

  it('reports a failed update', async () => {
    updateModelPrint.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    await flush();

    buttonWithText(modelRows()[0], 'Edit')?.click();
    await flush();

    const editModal = modal('app-model-form-modal')!;
    editModal.querySelector('form')?.dispatchEvent(new Event('submit'));
    await flush();

    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Error'));
  });

  it('deletes a model after the confirmation', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(modelRows()[0], 'Delete')?.click();
    await flush();

    expect(compiled().textContent).toContain('Bracket');

    buttonWithText(compiled(), 'Yes, Delete')?.click();
    await flush();

    expect(deleteModelPrint).toHaveBeenCalledWith('m1');
    expect(modal('app-confirm-delete')).toBeNull();
  });

  it('reports a failed deletion', async () => {
    deleteModelPrint.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    await flush();

    buttonWithText(modelRows()[0], 'Delete')?.click();
    await flush();
    buttonWithText(compiled(), 'Yes, Delete')?.click();
    await flush();

    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Error'));
  });

  it('creates and edits a category from the category modal', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Category')?.click();
    await flush();

    const categoryModal = modal('app-category-modal')!;
    const categoryInput = (): HTMLInputElement =>
      categoryModal.querySelector('input[placeholder="Category name"]') as HTMLInputElement;

    expect(categoryModal.textContent).toContain('Functional');

    categoryInput().value = 'Toys';
    categoryInput().dispatchEvent(new Event('input'));
    buttonWithText(categoryModal, 'Add')?.click();
    await flush();

    expect(createCategory).toHaveBeenCalledWith({ name: 'Toys' });

    buttonWithText(categoryModal, 'Edit')?.click();
    fixture.detectChanges();

    expect(categoryInput().value).toBe('Functional');

    categoryInput().value = 'Functional prints';
    categoryInput().dispatchEvent(new Event('input'));
    buttonWithText(categoryModal, 'Save Changes')?.click();
    await flush();

    expect(updateCategory).toHaveBeenCalledWith({ id: 'c1', name: 'Functional prints' });
  });

  it('reports a failed category save', async () => {
    createCategory.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Category')?.click();
    await flush();

    const categoryModal = modal('app-category-modal')!;
    const categoryInput = categoryModal.querySelector('input[placeholder="Category name"]') as HTMLInputElement;
    categoryInput.value = 'Toys';
    categoryInput.dispatchEvent(new Event('input'));
    buttonWithText(categoryModal, 'Add')?.click();
    await flush();

    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Error'));
  });

  it('deletes a category after the confirmation', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Category')?.click();
    await flush();

    (modal('app-category-modal')!.querySelector('button.danger') as HTMLButtonElement).click();
    await flush();

    buttonWithText(compiled(), 'Yes, Delete')?.click();
    await flush();

    expect(deleteCategory).toHaveBeenCalledWith('c1');
  });

  it('closes the category modal and reports a failed delete', async () => {
    deleteCategory.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Category')?.click();
    await flush();

    (modal('app-category-modal')!.querySelector('button.danger') as HTMLButtonElement).click();
    await flush();
    buttonWithText(compiled(), 'Yes, Delete')?.click();
    await flush();

    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Error'));

    compiled().querySelector('app-category-modal button.close')?.dispatchEvent(new Event('click'));
    await flush();

    expect(modal('app-category-modal')).toBeNull();
  });

  it('reports failures while loading the categories and the models', async () => {
    getCategories.mockReturnValue(throwError(() => new Error('boom')));
    getAllModelPrints.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    await flush();

    expect(alert).toHaveBeenCalledTimes(2);
    expect(compiled().querySelector('table')).toBeNull();
  });
});
