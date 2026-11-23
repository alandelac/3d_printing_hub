import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ResetPasswordPageComponent } from './reset-password-page.component';

describe('ResetPasswordPageComponent', () => {
  let fixture: ComponentFixture<ResetPasswordPageComponent>;
  let component: ResetPasswordPageComponent;
  let authServiceSpy: { resetPassword: ReturnType<typeof vi.fn> };

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    authServiceSpy = { resetPassword: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ResetPasswordPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => {
                  if (key === 'email') return 'param@example.com';
                  if (key === 'resetCode') return 'code123';
                  return null;
                }
              }
            }
          }
        },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('pre-fills email and resetCode from query parameters', () => {
    expect(component['form'].controls.email.value).toBe('param@example.com');
    expect(component['form'].controls.resetCode.value).toBe('code123');
  });

  it('validates password complexity and confirmation match', () => {
    component['form'].controls.password.setValue('weak');
    component['form'].controls.confirmPassword.setValue('mismatch');
    expect(component['form'].valid).toBe(false);

    component['form'].controls.password.setValue('Valid123!');
    component['form'].controls.confirmPassword.setValue('Valid123!');
    expect(component['form'].valid).toBe(true);
  });

  it('submits reset request and displays success message', () => {
    authServiceSpy.resetPassword.mockReturnValue(of(undefined));

    component['form'].controls.password.setValue('Valid123!');
    component['form'].controls.confirmPassword.setValue('Valid123!');
    component['submit']();
    fixture.detectChanges();

    expect(authServiceSpy.resetPassword).toHaveBeenCalledWith({
      email: 'param@example.com',
      resetCode: 'code123',
      newPassword: 'Valid123!'
    });
    expect(component['resetSuccess']()).toBe(true);
    expect(compiled().querySelector('.success-message')?.textContent).toContain('Password reset successful!');
  });

  it('handles server failure', () => {
    authServiceSpy.resetPassword.mockReturnValue(throwError(() => ({
      error: { errors: { Code: ['Invalid or expired reset token.'] } }
    })));

    component['form'].controls.password.setValue('Valid123!');
    component['form'].controls.confirmPassword.setValue('Valid123!');
    component['submit']();
    fixture.detectChanges();

    expect(component['resetSuccess']()).toBe(false);
    expect(component['error']()).toBe('Invalid or expired reset token.');
    expect(compiled().querySelector('.error')?.textContent).toContain('Invalid or expired reset token.');
  });
});
