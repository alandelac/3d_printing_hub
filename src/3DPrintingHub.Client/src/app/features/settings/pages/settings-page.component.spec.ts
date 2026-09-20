import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SettingRepository } from '../../../data/repositories/setting.repository';
import { Setting } from '../../../domain/models/setting.model';
import { SettingsPageComponent } from './settings-page.component';

describe('SettingsPageComponent', () => {
  const settings: Setting[] = [
    { id: '1', parameter: 'MaxWeight', value: 12.5 },
    { id: '2', parameter: 'Currency', value: 1 }
  ];

  let fixture: ComponentFixture<SettingsPageComponent>;
  let getAllSettings: ReturnType<typeof vi.fn>;
  let updateSetting: ReturnType<typeof vi.fn>;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const editButton = (): HTMLButtonElement | undefined =>
    compiled().querySelector('tbody button.secondary') as HTMLButtonElement | undefined;
  const modal = (): HTMLElement | null =>
    compiled().querySelector('app-setting-form-modal') as HTMLElement | null;
  const modalButtons = (): HTMLButtonElement[] =>
    Array.from(modal()?.querySelectorAll('button') ?? []);

  const flush = async (): Promise<void> => {
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    getAllSettings = vi.fn().mockReturnValue(of(settings));
    updateSetting = vi.fn().mockReturnValue(of(settings[0]));
    vi.stubGlobal('alert', vi.fn());

    await TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [
        { provide: SettingRepository, useValue: { getAllSettings, updateSetting } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPageComponent);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads the settings and renders them through the shared table', async () => {
    fixture.detectChanges();
    await flush();

    const headers = Array.from(compiled().querySelectorAll('thead th')).map(header =>
      header.textContent?.trim()
    );
    const rows = Array.from(compiled().querySelectorAll('tbody tr')).map(row =>
      row.textContent?.trim()
    );

    expect(getAllSettings).toHaveBeenCalledTimes(1);
    expect(compiled().querySelector('app-table table')).not.toBeNull();
    expect(headers).toEqual(['Parameter', 'Value', 'Actions']);
    expect(rows[0]).toContain('MaxWeight');
    expect(rows[0]).toContain('12.5');
  });

  it('falls back to an empty list when the API returns nothing', async () => {
    getAllSettings.mockReturnValue(of(null));

    fixture.detectChanges();
    await flush();

    expect(compiled().textContent).toContain('No settings found.');
  });

  it('reports a failed load without rendering rows', async () => {
    getAllSettings.mockReturnValue(throwError(() => new Error('offline')));

    fixture.detectChanges();
    await flush();

    expect(alert).toHaveBeenCalled();
    expect(compiled().textContent).toContain('No settings found.');
  });

  it('opens the edit modal and saves the new value', async () => {
    fixture.detectChanges();
    await flush();

    editButton()?.click();
    await flush();

    const parameter = modal()?.querySelector('input[type="text"]') as HTMLInputElement;

    expect(modal()).not.toBeNull();
    expect(parameter.value).toBe('MaxWeight');

    const value = modal()!.querySelector('input[type="number"]') as HTMLInputElement;
    value.value = '30';
    value.dispatchEvent(new Event('input'));

    modalButtons()
      .find(button => button.textContent?.includes('Save Changes'))
      ?.click();
    await flush();

    expect(updateSetting).toHaveBeenCalledWith('1', { parameter: 'MaxWeight', value: 30 });
    expect(modal()).toBeNull();
  });

  it('does not save when the value input is cleared', async () => {
    fixture.detectChanges();
    await flush();

    editButton()?.click();
    await flush();

    const value = modal()!.querySelector('input[type="number"]') as HTMLInputElement;
    value.value = '';
    value.dispatchEvent(new Event('input'));

    modalButtons()
      .find(button => button.textContent?.includes('Save Changes'))
      ?.click();
    await flush();

    expect(updateSetting).not.toHaveBeenCalled();
  });

  it('reports a failed save and keeps the modal open', async () => {
    updateSetting.mockReturnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    await flush();

    editButton()?.click();
    await flush();

    modalButtons()
      .find(button => button.textContent?.includes('Save Changes'))
      ?.click();
    await flush();

    expect(alert).toHaveBeenCalled();
    expect(modal()).not.toBeNull();
  });

  it('closes the edit modal when the operator cancels', async () => {
    fixture.detectChanges();
    await flush();

    editButton()?.click();
    await flush();

    modalButtons()
      .find(button => button.textContent === 'Cancel')
      ?.click();
    await flush();

    expect(modal()).toBeNull();
  });
});
