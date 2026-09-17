import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

const matchingPasswords: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsDoNotMatch: true };
};

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/\d/),
      Validators.pattern(/[a-z]/),
      Validators.pattern(/[A-Z]/),
      Validators.pattern(/[^a-zA-Z0-9]/)
    ]],
    confirmPassword: ['', Validators.required]
  }, { validators: matchingPasswords });

  protected submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();

    this.authService.register({ email, password }).subscribe({
      next: () => this.authService.login({ email, password }).subscribe({
        next: () => void this.router.navigate(['/dashboard']),
        error: () => {
          this.error.set('Your account was created, but sign-in failed. Return to login and try again.');
          this.loading.set(false);
        }
      }),
      error: (response: HttpErrorResponse) => {
        const errors = response.error?.errors as Record<string, string[]> | undefined;
        const serverMessage = errors ? Object.values(errors).flat()[0] : undefined;
        this.error.set(serverMessage ?? 'Could not create the account. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
