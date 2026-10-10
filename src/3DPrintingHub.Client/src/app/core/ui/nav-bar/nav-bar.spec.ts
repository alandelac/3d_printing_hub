import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavBar } from './nav-bar';
import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../../theme/theme.service';

describe('NavBar', () => {
  let fixture: ComponentFixture<NavBar>;
  let authService: AuthService;
  let themeService: ThemeService;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark-theme');

    authService = {
      logout: vi.fn(),
    } as unknown as AuthService;

    await TestBed.configureTestingModule({
      imports: [NavBar],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    themeService = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark-theme');
  });

  it('renders the navigation links with the shared navbar control convention', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand')?.textContent).toContain('3DPrintingHub');

    const links = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.links a'));

    expect(links.map(link => link.textContent?.trim())).toEqual([
      'Dashboard',
      'Filaments',
      'Models',
      'Stocked',
      'Print Jobs',
      'Sales',
      'Clients',
      'Settings',
    ]);
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '/dashboard',
      '/filaments',
      '/models',
      '/stocked',
      '/print-jobs',
      '/sales',
      '/clients',
      '/settings',
    ]);
    expect(links.every(link => link.classList.contains('nav-link'))).toBe(true);
  });

  it('keeps the brand on the left, links centered, and actions on the right', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const inner = compiled.querySelector('.nav-inner');
    const children = Array.from(inner?.children ?? []).map(child => child.className);

    expect(children).toEqual(['brand', 'links', 'nav-actions']);
    expect(compiled.querySelector('.nav-actions .theme-toggle')).not.toBeNull();
  });

  it('renders the sign-out control with the shared navbar control convention and triggers logout', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const buttons = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.nav-actions button'));
    const button = buttons.find(candidate => candidate.textContent?.trim() === 'Sign out');

    expect(button).not.toBeUndefined();
    expect(button?.classList.contains('nav-link')).toBe(true);
    expect(button?.getAttribute('type')).toBe('button');

    button?.click();

    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('renders a theme toggle that switches between light and dark modes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const toggle = compiled.querySelector<HTMLButtonElement>('.theme-toggle');

    expect(toggle).not.toBeNull();
    expect(toggle?.getAttribute('type')).toBe('button');
    expect(toggle?.textContent?.trim()).toBe('');
    expect(toggle?.querySelector('.moon-icon')).not.toBeNull();
    expect(toggle?.querySelector('.sun-icon')).not.toBeNull();
    expect(toggle?.getAttribute('aria-label')).toBe('Switch to dark mode');
    expect(toggle?.getAttribute('aria-pressed')).toBe('false');

    toggle?.click();
    fixture.detectChanges();

    expect(themeService.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(localStorage.getItem('3dprintinghub.theme')).toBe('dark');

    const updatedToggle = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.theme-toggle'
    );
    expect(updatedToggle?.textContent?.trim()).toBe('');
    expect(updatedToggle?.getAttribute('aria-label')).toBe('Switch to light mode');
    expect(updatedToggle?.getAttribute('aria-pressed')).toBe('true');

    updatedToggle?.click();
    fixture.detectChanges();

    expect(themeService.theme()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });
});
