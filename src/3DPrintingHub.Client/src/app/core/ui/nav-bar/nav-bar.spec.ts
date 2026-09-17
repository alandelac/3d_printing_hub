import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterOutlet } from '@angular/router';
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

  it('renders navigation links and triggers logout', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand')?.textContent).toContain('3DPrintingHub');
    expect(compiled.querySelectorAll('a').length).toBeGreaterThan(0);

    const button = compiled.querySelector('button[type="button"]') as HTMLButtonElement;
    button.click();

    expect(authService.logout).toHaveBeenCalled();
  });
});
