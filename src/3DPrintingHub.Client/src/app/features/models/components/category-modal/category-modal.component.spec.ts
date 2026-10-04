import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModelPrintCategory } from '../../../../domain/models/model-print-category.model';
import { CategoryModalComponent } from './category-modal.component';

const categories: ModelPrintCategory[] = [
  { id: 'c1', name: 'Functional' },
  { id: 'c2', name: 'Decor' }
];

describe('CategoryModalComponent', () => {
  let fixture: ComponentFixture<CategoryModalComponent>;
  let component: CategoryModalComponent;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const nameInput = (): HTMLInputElement =>
    compiled().querySelector('input[placeholder="Category name"]') as HTMLInputElement;
  const rows = (): HTMLTableRowElement[] =>
    Array.from(compiled().querySelectorAll<HTMLTableRowElement>('tbody tr'));
  const buttonWithText = (text: string): HTMLButtonElement | undefined =>
    Array.from(compiled().querySelectorAll<HTMLButtonElement>('button')).find(
      button => button.textContent?.trim() === text
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CategoryModalComponent] }).compileComponents();

    fixture = TestBed.createComponent(CategoryModalComponent);
    component = fixture.componentInstance;
  });

  it('renders the categories through the shared table', () => {
    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();

    const headers = Array.from(compiled().querySelectorAll('thead th')).map(header =>
      header.textContent?.trim()
    );

    expect(compiled().querySelector('.modal-content h3')?.textContent).toBe('Categories');
    expect(headers).toEqual(['Name', 'Actions']);
    expect(rows().map(row => row.querySelector('td')?.textContent?.trim())).toEqual([
      'Functional',
      'Decor'
    ]);
  });

  it('shows the empty message when there are no categories', () => {
    fixture.detectChanges();

    expect(compiled().textContent).toContain('No categories found.');
    expect(compiled().querySelector('table')).toBeNull();
  });

  it('emits a new category and clears the input', () => {
    const save = vi.fn();
    component.save.subscribe(save);

    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();

    const input = nameInput();
    input.value = '  Toys  ';
    input.dispatchEvent(new Event('input'));

    buttonWithText('Add')?.click();
    fixture.detectChanges();

    expect(save).toHaveBeenCalledWith({ id: '', name: 'Toys' });
    expect(nameInput().value).toBe('');
  });

  it('does not emit an empty category name', () => {
    const save = vi.fn();
    component.save.subscribe(save);

    fixture.detectChanges();

    nameInput().value = '   ';
    nameInput().dispatchEvent(new Event('input'));
    buttonWithText('Add')?.click();

    expect(save).not.toHaveBeenCalled();
  });

  it('edits an existing category and can cancel the edit', () => {
    const save = vi.fn();
    component.save.subscribe(save);

    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();

    buttonWithText('Edit')?.click();
    fixture.detectChanges();

    expect(nameInput().value).toBe('Functional');
    expect(buttonWithText('Save Changes')).toBeDefined();

    buttonWithText('Cancel')?.click();
    fixture.detectChanges();

    expect(nameInput().value).toBe('');
    expect(buttonWithText('Save Changes')).toBeUndefined();

    buttonWithText('Edit')?.click();
    fixture.detectChanges();

    const input = nameInput();
    input.value = 'Functional prints';
    input.dispatchEvent(new Event('input'));

    buttonWithText('Save Changes')?.click();

    expect(save).toHaveBeenCalledWith({ id: 'c1', name: 'Functional prints' });
  });

  it('emits the category to remove', () => {
    const remove = vi.fn();
    component.remove.subscribe(remove);

    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();

    Array.from(compiled().querySelectorAll<HTMLButtonElement>('button.danger'))[1].click();

    expect(remove).toHaveBeenCalledWith(categories[1]);
  });

  it('emits close from the modal shell and resets the form', () => {
    const close = vi.fn();
    component.close.subscribe(close);

    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();

    const input = nameInput();
    input.value = 'Half typed';
    input.dispatchEvent(new Event('input'));

    compiled().querySelector('button.close')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(close).toHaveBeenCalledTimes(1);
    expect(nameInput().value).toBe('');
  });
});
