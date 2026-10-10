import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorSelectComponent } from './color-select.component';

describe('ColorSelectComponent', () => {
  let fixture: ComponentFixture<ColorSelectComponent>;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorSelectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ColorSelectComponent);
    fixture.componentRef.setInput('colors', [
      { id: 'col1', color: 'White', colorCode: '#FFFFFF' },
      { id: 'col2', color: 'Black', colorCode: '#000000' }
    ]);
    fixture.componentRef.setInput('value', '');
    fixture.detectChanges();
  });

  it('shows the placeholder when nothing is selected', () => {
    expect(compiled().querySelector('.color-select-label')?.textContent?.trim()).toBe('Select Color');
  });

  it('shows the swatch, name and hex code in the options and the trigger once picked', () => {
    (compiled().querySelector('.color-select-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();

    const options = Array.from(compiled().querySelectorAll<HTMLButtonElement>('.color-select-options button'));
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('White (#FFFFFF)');

    const swatches = Array.from(
      compiled().querySelectorAll<HTMLElement>('.color-select-options .swatch')
    ).map(s => s.style.background);
    expect(swatches).toEqual(['rgb(255, 255, 255)', 'rgb(0, 0, 0)']);

    options[1].click();
    fixture.detectChanges();

    expect(compiled().querySelector('.color-select-label')?.textContent?.trim()).toBe('Black (#000000)');
    expect(
      (compiled().querySelector('.color-select-trigger .swatch') as HTMLElement).style.background
    ).toBe('rgb(0, 0, 0)');
    expect(compiled().querySelector('.color-select-options')).toBeNull();
  });

  it('closes the dropdown when clicking outside of it', () => {
    (compiled().querySelector('.color-select-trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(compiled().querySelector('.color-select-options')).not.toBeNull();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(compiled().querySelector('.color-select-options')).toBeNull();
  });

  it('keeps a native select in sync for keyboard and assistive tech', () => {
    const native = compiled().querySelector('select') as HTMLSelectElement;
    native.value = 'col1';
    native.dispatchEvent(new Event('change'));

    expect(fixture.componentInstance.value()).toBe('col1');
  });
});
