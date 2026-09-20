import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingFormModalComponent } from './setting-form-modal.component';

describe('SettingFormModalComponent', () => {
  let fixture: ComponentFixture<SettingFormModalComponent>;
  let component: SettingFormModalComponent;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const saveButton = (): HTMLButtonElement | undefined =>
    Array.from(compiled().querySelectorAll('button')).find(button =>
      button.textContent?.includes('Save Changes')
    );
  const cancelButton = (): HTMLButtonElement | undefined =>
    Array.from(compiled().querySelectorAll('button')).find(button => button.textContent === 'Cancel');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SettingFormModalComponent] }).compileComponents();

    fixture = TestBed.createComponent(SettingFormModalComponent);
    component = fixture.componentInstance;
  });

  it('renders the setting passed in', () => {
    fixture.componentRef.setInput('setting', { id: '1', parameter: 'MaxWeight', value: 12.5 });
    fixture.detectChanges();

    const parameter = compiled().querySelector('input[type="text"]') as HTMLInputElement;
    const value = compiled().querySelector('input[type="number"]') as HTMLInputElement;

    expect(compiled().querySelector('.modal-content h3')?.textContent).toBe('Edit Setting');
    expect(parameter.value).toBe('MaxWeight');
    expect(parameter.readOnly).toBe(true);
    expect(value.value).toBe('12.5');
  });

  it('emits the edited parameter and value on save', () => {
    const save = vi.fn();
    component.save.subscribe(save);

    fixture.componentRef.setInput('setting', { id: '1', parameter: 'MaxWeight', value: 12.5 });
    fixture.detectChanges();

    const value = compiled().querySelector('input[type="number"]') as HTMLInputElement;
    value.value = '20';
    value.dispatchEvent(new Event('input'));

    saveButton()?.click();

    expect(save).toHaveBeenCalledWith({ parameter: 'MaxWeight', value: 20 });
  });

  it('emits a null value when the value input is cleared', () => {
    const save = vi.fn();
    component.save.subscribe(save);

    fixture.componentRef.setInput('setting', { id: '1', parameter: 'MaxWeight', value: 12.5 });
    fixture.detectChanges();

    const value = compiled().querySelector('input[type="number"]') as HTMLInputElement;
    value.value = '';
    value.dispatchEvent(new Event('input'));

    saveButton()?.click();

    expect(save).toHaveBeenCalledWith({ parameter: 'MaxWeight', value: null });
  });

  it('disables the form buttons and shows the saving label while loading', () => {
    fixture.componentRef.setInput('setting', { id: '1', parameter: 'MaxWeight', value: 12.5 });
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const formButtons = Array.from(compiled().querySelectorAll<HTMLButtonElement>('.add-form button'));

    expect(compiled().textContent).toContain('Saving...');
    expect(formButtons.every(button => button.disabled)).toBe(true);
  });

  it('emits cancel from the cancel button, the close button and the backdrop', () => {
    const cancel = vi.fn();
    component.cancel.subscribe(cancel);

    fixture.componentRef.setInput('setting', { id: '1', parameter: 'MaxWeight', value: 12.5 });
    fixture.detectChanges();

    cancelButton()?.click();
    compiled().querySelector('button.close')?.dispatchEvent(new Event('click'));
    compiled().querySelector('.modal-backdrop')?.dispatchEvent(new Event('click'));

    expect(cancel).toHaveBeenCalledTimes(3);
  });
});
