import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavBar } from './nav-bar';
import { AuthService } from '../../auth/auth.service';

describe('NavBar', () => {
  let fixture: ComponentFixture<NavBar>;
  let authService: AuthService;

  beforeEach(async () => {
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
  });

  it('renders the navigation links with the shared navbar control convention', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand')?.textContent).toContain('3DPrintingHub');

    const links = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.links a'));

    expect(links.map(link => link.textContent?.trim())).toEqual([
      'Clients',
      'Dashboard',
      'Filaments',
      'Models',
      'Sales',
      'Settings',
      'Stocked',
    ]);
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '/clients',
      '/dashboard',
      '/filaments',
      '/models',
      '/sales',
      '/settings',
      '/stocked',
    ]);
    expect(links.every(link => link.classList.contains('nav-link'))).toBe(true);
  });

  it('renders the sign-out control with the shared navbar control convention and triggers logout', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const button = compiled.querySelector<HTMLButtonElement>('button');

    expect(button).not.toBeNull();
    expect(button?.classList.contains('nav-link')).toBe(true);
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.textContent?.trim()).toBe('Sign out');

    button?.click();

    expect(authService.logout).toHaveBeenCalledTimes(1);
  });
});
