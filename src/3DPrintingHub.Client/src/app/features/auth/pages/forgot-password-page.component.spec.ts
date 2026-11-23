import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ForgotPasswordPageComponent } from './forgot-password-page.component';

describe('ForgotPasswordPageComponent', () => {
  let fixture: ComponentFixture<ForgotPasswordPageComponent>;
  let component: ForgotPasswordPageComponent;
  let authServiceSpy: { forgotPassword: ReturnType<typeof vi.fn> };

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    authServiceSpy = { forgotPassword: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders initial form and invalidates empty email', () => {
    expect(component['form'].valid).toBe(false);
    expect(compiled().querySelector('h1')?.textContent).toBe('Recover access');

    component['submit']();
    fixture.detectChanges();

    expect(component['form'].controls.email.touched).toBe(true);
    expect(authServiceSpy.forgotPassword).not.toHaveBeenCalled();
  });

  it('submits valid email and renders success message', () => {
    authServiceSpy.forgotPassword.mockReturnValue(of(undefined));

    component['form'].controls.email.setValue('user@example.com');
    component['submit']();
    fixture.detectChanges();

    expect(authServiceSpy.forgotPassword).toHaveBeenCalledWith({ email: 'user@example.com' });
    expect(component['submitted']()).toBe(true);
    expect(compiled().querySelector('.success-message')?.textContent).toContain('Instructions sent!');
  });

  it('handles server error on submit', () => {
    authServiceSpy.forgotPassword.mockReturnValue(throwError(() => new Error('Server error')));

    component['form'].controls.email.setValue('user@example.com');
    component['submit']();
    fixture.detectChanges();

    expect(component['submitted']()).toBe(false);
    expect(component['error']()).toBe('Unable to process your request at this moment. Please try again.');
    expect(compiled().querySelector('.error')?.textContent).toContain('Unable to process your request');
  });
});
