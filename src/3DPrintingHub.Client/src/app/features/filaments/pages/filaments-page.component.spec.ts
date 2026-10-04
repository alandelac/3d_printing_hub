import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { FilamentBrand } from '../../../domain/models/filament-brand.model';
import { FilamentColor } from '../../../domain/models/filament-color.model';
import { FilamentMaterialType } from '../../../domain/models/filament-material-type.model';
import { FilamentProfile } from '../../../domain/models/filament-profile.model';
import { Filament } from '../../../domain/models/filament.model';
import { FilamentsPageComponent } from './filaments-page.component';

const colors: FilamentColor[] = [
  { id: 'col1', color: 'White', colorCode: '#FFFFFF' },
  { id: 'col2', color: 'Black', colorCode: '#000000' }
];

const brands: FilamentBrand[] = [
  { id: 'b1', name: 'Acme' },
  { id: 'b2', name: 'Zeta' }
];

const materialTypes: FilamentMaterialType[] = [
  { id: 't1', name: 'PLA' },
  { id: 't2', name: 'PETG' }
];

const profiles: FilamentProfile[] = [
  { id: 'p1', brandId: 'b1', brandName: 'Acme', materialTypeId: 't1', materialTypeName: 'PLA' }
];

const filament = (
  id: string,
  brandId: string,
  brandName: string,
  materialTypeName: string,
  colorName: string,
  weight: number
): Filament => ({
  id,
  filamentProfileId: `profile-${id}`,
  filamentProfile: { id: `profile-${id}`, brandId, brandName, materialTypeId: 't1', materialTypeName },
  filamentColorId: 'col1',
  colorName,
  colorCode: '#FFFFFF',
  remainingWeightGrams: weight,
  minCost: 10,
  maxCost: 20,
  lastCost: 15,
  lastPurchaseDate: '2026-01-02T00:00:00',
  buyAgain: true,
  buyLink: 'https://shop.example/filament'
});

const filaments: Filament[] = [
  filament('f1', 'b1', 'Acme', 'PLA', 'White', 100),
  filament('f2', 'b2', 'Zeta', 'PETG', 'Black', 500)
];

describe('FilamentsPageComponent', () => {
  let fixture: ComponentFixture<FilamentsPageComponent>;
  let getFilaments: ReturnType<typeof vi.fn>;
  let createFilament: ReturnType<typeof vi.fn>;
  let updateFilament: ReturnType<typeof vi.fn>;
  let deleteFilament: ReturnType<typeof vi.fn>;
  let adjustFilamentWeight: ReturnType<typeof vi.fn>;
  let getColors: ReturnType<typeof vi.fn>;
  let createColor: ReturnType<typeof vi.fn>;
  let updateColor: ReturnType<typeof vi.fn>;
  let deleteColor: ReturnType<typeof vi.fn>;
  let getBrands: ReturnType<typeof vi.fn>;
  let createBrand: ReturnType<typeof vi.fn>;
  let updateBrand: ReturnType<typeof vi.fn>;
  let deleteBrand: ReturnType<typeof vi.fn>;
  let getMaterialTypes: ReturnType<typeof vi.fn>;
  let createMaterialType: ReturnType<typeof vi.fn>;
  let updateMaterialType: ReturnType<typeof vi.fn>;
  let deleteMaterialType: ReturnType<typeof vi.fn>;
  let getFilamentProfiles: ReturnType<typeof vi.fn>;
  let createFilamentProfile: ReturnType<typeof vi.fn>;
  let updateFilamentProfile: ReturnType<typeof vi.fn>;
  let deleteFilamentProfile: ReturnType<typeof vi.fn>;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const tableRows = (): HTMLTableRowElement[] =>
    Array.from(compiled().querySelectorAll<HTMLTableRowElement>('app-table tbody tr'));
  const modalRows = (selector: string): HTMLTableRowElement[] =>
    Array.from(
      compiled().querySelectorAll<HTMLTableRowElement>(`${selector} app-table tbody tr`)
    );
  const headers = (): string[] =>
    Array.from(compiled().querySelectorAll('app-table thead th')).map(header => header.textContent?.trim() ?? '');
  const headerWithText = (text: string): HTMLTableCellElement =>
    Array.from(compiled().querySelectorAll<HTMLTableCellElement>('app-table thead th')).find(header =>
      header.textContent?.trim().startsWith(text)
    )!;
  const firstRowText = (): string => tableRows()[0]?.textContent ?? '';
  const modal = (selector: string): HTMLElement | null => compiled().querySelector(selector) as HTMLElement | null;
  const buttonWithText = (root: HTMLElement, text: string): HTMLButtonElement | undefined =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
      button => button.textContent?.trim() === text
    );
  const inputWithPlaceholder = (root: HTMLElement, placeholder: string): HTMLInputElement =>
    root.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement;
  const typeInto = (input: HTMLInputElement, value: string): void => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const select = (element: HTMLSelectElement, value: string): void => {
    element.value = value;
    element.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };
  const typeFilter = (selector: string, term: string): void => {
    typeInto(compiled().querySelector(`${selector === 'app-filaments-page' ? '' : selector + ' '}input.filter-input`) as HTMLInputElement, term);
  };
  const flush = async (): Promise<void> => {
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const confirmDelete = async (): Promise<void> => {
    buttonWithText(compiled().querySelector('app-confirm-delete') as HTMLElement, 'Yes, Delete')?.click();
    await flush();
  };

  beforeEach(async () => {
    getFilaments = vi.fn().mockReturnValue(of(filaments));
    createFilament = vi.fn().mockReturnValue(of({ id: 'f3' }));
    updateFilament = vi.fn().mockReturnValue(of(filaments[0]));
    deleteFilament = vi.fn().mockReturnValue(of(undefined));
    adjustFilamentWeight = vi.fn().mockReturnValue(of(filaments[0]));
    getColors = vi.fn().mockReturnValue(of(colors));
    createColor = vi.fn().mockReturnValue(of({ id: 'col3' }));
    updateColor = vi.fn().mockReturnValue(of(colors[0]));
    deleteColor = vi.fn().mockReturnValue(of(undefined));
    getBrands = vi.fn().mockReturnValue(of(brands));
    createBrand = vi.fn().mockReturnValue(of({ id: 'b3' }));
    updateBrand = vi.fn().mockReturnValue(of(brands[0]));
    deleteBrand = vi.fn().mockReturnValue(of(undefined));
    getMaterialTypes = vi.fn().mockReturnValue(of(materialTypes));
    createMaterialType = vi.fn().mockReturnValue(of({ id: 't3' }));
    updateMaterialType = vi.fn().mockReturnValue(of(materialTypes[0]));
    deleteMaterialType = vi.fn().mockReturnValue(of(undefined));
    getFilamentProfiles = vi.fn().mockReturnValue(of(profiles));
    createFilamentProfile = vi.fn().mockReturnValue(of({ id: 'p2' }));
    updateFilamentProfile = vi.fn().mockReturnValue(of(profiles[0]));
    deleteFilamentProfile = vi.fn().mockReturnValue(of(undefined));
    vi.stubGlobal('alert', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [FilamentsPageComponent],
      providers: [
        {
          provide: FilamentRepository,
          useValue: {
            getFilaments,
            createFilament,
            updateFilament,
            deleteFilament,
            adjustFilamentWeight,
            getColors,
            createColor,
            updateColor,
            deleteColor,
            getBrands,
            createBrand,
            updateBrand,
            deleteBrand,
            getMaterialTypes,
            createMaterialType,
            updateMaterialType,
            deleteMaterialType,
            getFilamentProfiles,
            createFilamentProfile,
            updateFilamentProfile,
            deleteFilamentProfile
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FilamentsPageComponent);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loads the filaments and renders them through the shared table', async () => {
    fixture.detectChanges();
    await flush();

    expect(getFilaments).toHaveBeenCalledTimes(1);
    expect(headers()).toEqual([
      'Profile',
      'Color',
      'Remaining Weight',
      'Min Cost',
      'Max Cost',
      'Last Cost',
      'Last Purchase',
      'Buy Again',
      'Buy URL',
      'Actions'
    ]);
    expect(tableRows().length).toBe(2);
    expect(firstRowText()).toContain('Acme - PLA');
    expect(firstRowText()).toContain('100g');
  });

  it('filters the filaments through the shared filter input', async () => {
    fixture.detectChanges();
    await flush();

    typeFilter('app-filaments-page', 'zeta');

    expect(tableRows().length).toBe(1);
    expect(firstRowText()).toContain('Zeta - PETG');

    typeFilter('app-filaments-page', '500');

    expect(tableRows().length).toBe(1);
    expect(firstRowText()).toContain('500g');
  });

  it('orders the filaments from the shared sortable headers', async () => {
    fixture.detectChanges();
    await flush();

    headerWithText('Remaining Weight').click();
    fixture.detectChanges();

    expect(firstRowText()).toContain('Acme - PLA');
    expect(headerWithText('Remaining Weight').textContent?.trim()).toBe('Remaining Weight ▲');

    headerWithText('Remaining Weight').click();
    fixture.detectChanges();

    expect(firstRowText()).toContain('Zeta - PETG');
    expect(headerWithText('Remaining Weight').textContent?.trim()).toBe('Remaining Weight ▼');

    headerWithText('Profile').click();
    fixture.detectChanges();

    expect(firstRowText()).toContain('Acme - PLA');
  });

  it('shows the empty state when there are no filaments', async () => {
    getFilaments.mockReturnValue(of([]));

    fixture.detectChanges();
    await flush();

    expect(compiled().textContent).toContain('No filaments found.');
    expect(compiled().querySelector('app-table table')).toBeNull();
  });

  it('creates a filament from the add modal', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Add New Filament')?.click();
    await flush();

    const form = modal('app-modal')!;
    const selects = Array.from(form.querySelectorAll<HTMLSelectElement>('select'));
    select(selects[0], 'p1');
    select(selects[1], 'col1');
    typeInto(inputWithPlaceholder(form, 'Min Cost'), '10');
    typeInto(inputWithPlaceholder(form, 'Max Cost'), '25');
    typeInto(inputWithPlaceholder(form, 'Last Cost'), '18');
    typeInto(inputWithPlaceholder(form, 'Remaining Weight'), '750');

    buttonWithText(form, 'Add Filament')?.click();
    await flush();

    expect(createFilament).toHaveBeenCalledWith(
      expect.objectContaining({
        filamentProfileId: 'p1',
        filamentColorId: 'col1',
        minCost: 10,
        maxCost: 25,
        lastCost: 18,
        remainingWeightGrams: 750
      })
    );
  });

  it('refuses an incomplete filament form', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Add New Filament')?.click();
    await flush();

    const form = modal('app-modal')!;
    const selects = Array.from(form.querySelectorAll<HTMLSelectElement>('select'));

    buttonWithText(form, 'Add Filament')?.click();
    expect(alert).toHaveBeenCalledWith('Please select a filament profile');

    select(selects[0], 'p1');
    buttonWithText(form, 'Add Filament')?.click();
    expect(alert).toHaveBeenCalledWith('Please select a color');

    select(selects[1], 'col1');
    buttonWithText(form, 'Add Filament')?.click();
    expect(alert).toHaveBeenCalledWith('Please fill in all cost fields');

    expect(createFilament).not.toHaveBeenCalled();
  });

  it('edits a filament from the row actions', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(tableRows()[0], 'Edit')?.click();
    await flush();

    const form = modal('app-modal')!;

    expect(form.textContent).toContain('Edit Filament');

    typeInto(inputWithPlaceholder(form, 'Min Cost'), '42');
    buttonWithText(form, 'Save Changes')?.click();
    await flush();

    expect(updateFilament).toHaveBeenCalledWith(expect.objectContaining({ id: 'f1', minCost: 42 }));
    expect(modal('app-modal')).toBeNull();
  });

  it('reports a failed filament update', async () => {
    updateFilament.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    await flush();

    buttonWithText(tableRows()[0], 'Edit')?.click();
    await flush();

    const form = modal('app-modal')!;
    buttonWithText(form, 'Save Changes')?.click();
    await flush();

    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Error'));
    expect(modal('app-modal')).not.toBeNull();
  });

  it('deletes a filament after the confirmation', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(tableRows()[0], 'Delete')?.click();
    await flush();

    expect(compiled().textContent).toContain('Acme - PLA');

    await confirmDelete();

    expect(deleteFilament).toHaveBeenCalledWith('f1');
    expect(modal('app-confirm-delete')).toBeNull();
  });


  it('reports a failed load and keeps the page usable', async () => {
    getFilaments.mockReturnValue(throwError(() => new Error('offline')));
    getColors.mockReturnValue(throwError(() => new Error('offline')));

    fixture.detectChanges();
    await flush();

    expect(console.error).toHaveBeenCalled();
    expect(compiled().textContent).toContain('No filaments found.');
  });

  it('adjusts the filament weight via the inline row controls and rejects empty input', async () => {
    fixture.detectChanges();
    await flush();

    const row = tableRows()[0];
    const input = row.querySelector('input[type="number"]') as HTMLInputElement;
    const addButton = buttonWithText(row, '+')!;
    const subtractButton = buttonWithText(row, '−')!;
    const updateButton = buttonWithText(row, 'Update')!;

    addButton.click();
    await flush();

    expect(alert).toHaveBeenCalledWith('Please enter a valid quantity greater than 0.');
    expect(adjustFilamentWeight).not.toHaveBeenCalled();

    typeInto(input, '250');
    addButton.click();
    await flush();

    expect(adjustFilamentWeight).toHaveBeenCalledWith({
      filamentId: 'f1',
      grams: 250,
      amount: 250,
      reason: 'Manual weight adjustment'
    });

    typeInto(input, '100');
    subtractButton.click();
    await flush();

    expect(adjustFilamentWeight).toHaveBeenLastCalledWith({
      filamentId: 'f1',
      grams: -100,
      amount: -100,
      reason: 'Manual weight adjustment'
    });

    typeInto(input, '400');
    updateButton.click();
    await flush();

    expect(adjustFilamentWeight).toHaveBeenLastCalledWith({
      filamentId: 'f1',
      grams: 300,
      amount: 400,
      reason: 'Set remaining weight'
    });
  });

  it('manages the colors modal on the shared table', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Colors')?.click();
    await flush();

    const colorsModal = modal('app-colors-modal')!;

    expect(modalRows('app-colors-modal').length).toBe(2);

    typeFilter('app-colors-modal', 'black');

    expect(modalRows('app-colors-modal').length).toBe(1);

    typeFilter('app-colors-modal', '');
    typeInto(inputWithPlaceholder(colorsModal, 'Color name'), 'Red');
    typeInto(inputWithPlaceholder(colorsModal, '#RRGGBB'), '#FF0000');
    buttonWithText(colorsModal, 'Add')?.click();
    await flush();

    expect(createColor).toHaveBeenCalledWith({ color: 'Red', colorCode: '#FF0000' });

    buttonWithText(modalRows('app-colors-modal')[0], 'Edit')?.click();
    fixture.detectChanges();

    expect(inputWithPlaceholder(colorsModal, 'Color name').value).toBe('White');

    typeInto(inputWithPlaceholder(colorsModal, 'Color name'), 'Ivory');
    buttonWithText(colorsModal, 'Save Changes')?.click();
    await flush();

    expect(updateColor).toHaveBeenCalledWith({ id: 'col1', color: 'Ivory', colorCode: '#FFFFFF' });

    buttonWithText(modalRows('app-colors-modal')[0], 'Delete')?.click();
    await flush();
    await confirmDelete();

    expect(deleteColor).toHaveBeenCalledWith('col1');
  });

  it('manages the brands modal', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Brands')?.click();
    await flush();

    const brandsModal = modal('app-brands-modal')!;
    typeInto(inputWithPlaceholder(brandsModal, 'Brand name'), 'Prusa');
    buttonWithText(brandsModal, 'Add Brand')?.click();
    await flush();

    expect(createBrand).toHaveBeenCalledWith({ name: 'Prusa' });

    buttonWithText(modalRows('app-brands-modal')[0], 'Edit')?.click();
    fixture.detectChanges();

    typeInto(inputWithPlaceholder(brandsModal, 'Brand name'), 'Acme 2');
    buttonWithText(brandsModal, 'Save Changes')?.click();
    await flush();

    expect(updateBrand).toHaveBeenCalledWith({ id: 'b1', name: 'Acme 2' });

    buttonWithText(modalRows('app-brands-modal')[0], 'Delete')?.click();
    await flush();
    await confirmDelete();
    await flush();

    expect(deleteBrand).toHaveBeenCalledWith('b1');
  });

  it('manages the material types modal', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Material Types')?.click();
    await flush();

    const materialTypesModal = modal('app-material-types-modal')!;
    typeInto(inputWithPlaceholder(materialTypesModal, 'Material Type name'), 'TPU');
    buttonWithText(materialTypesModal, 'Add')?.click();
    await flush();

    expect(createMaterialType).toHaveBeenCalledWith({ name: 'TPU' });

    buttonWithText(modalRows('app-material-types-modal')[0], 'Edit')?.click();
    fixture.detectChanges();

    typeInto(inputWithPlaceholder(materialTypesModal, 'Material Type name'), 'TPU 95A');
    buttonWithText(materialTypesModal, 'Save Changes')?.click();
    await flush();

    expect(updateMaterialType).toHaveBeenCalledWith({ id: 't1', name: 'TPU 95A' });

    buttonWithText(modalRows('app-material-types-modal')[0], 'Delete')?.click();
    await flush();
    await confirmDelete();
    await flush();

    expect(deleteMaterialType).toHaveBeenCalledWith('t1');
  });

  it('manages the filament profiles modal', async () => {
    fixture.detectChanges();
    await flush();

    buttonWithText(compiled(), 'Filament Profiles')?.click();
    await flush();

    const profilesModal = modal('app-modal')!;
    const selects = Array.from(profilesModal.querySelectorAll<HTMLSelectElement>('select'));

    expect(getFilamentProfiles).toHaveBeenCalledTimes(2);
    expect(modalRows('app-modal').length).toBe(1);

    buttonWithText(profilesModal, 'Add Filament Profile')?.click();
    expect(alert).toHaveBeenCalledWith('Please select a brand');

    select(selects[0], 'b1');
    buttonWithText(profilesModal, 'Add Filament Profile')?.click();
    expect(alert).toHaveBeenCalledWith('Please select a material type');

    select(selects[1], 't1');
    buttonWithText(profilesModal, 'Add Filament Profile')?.click();
    await flush();

    expect(createFilamentProfile).toHaveBeenCalledWith(
      expect.objectContaining({ brandId: 'b1', materialTypeId: 't1' })
    );

    buttonWithText(modalRows('app-modal')[0], 'Edit')?.click();
    fixture.detectChanges();

    select(selects[0], 'b1');
    select(selects[1], 't1');
    buttonWithText(profilesModal, 'Save Changes')?.click();
    await flush();

    expect(updateFilamentProfile).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }));

    buttonWithText(modalRows('app-modal')[0], 'Delete')?.click();
    await flush();
    await confirmDelete();

    expect(deleteFilamentProfile).toHaveBeenCalledWith('p1');

    compiled().querySelector('app-modal button.close')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(modal('app-modal')).toBeNull();
  });
});

