import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

const matchingPasswords: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsDoNotMatch: true };
};

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.css'
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly resetSuccess = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    resetCode: ['', Validators.required],
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

  ngOnInit(): void {
    const queryEmail = this.route.snapshot.queryParamMap.get('email');
    const queryCode = this.route.snapshot.queryParamMap.get('resetCode');

    if (queryEmail) {
      this.form.controls.email.setValue(queryEmail);
    }
    if (queryCode) {
      this.form.controls.resetCode.setValue(queryCode);
    }
  }

  protected submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { email, resetCode, password } = this.form.getRawValue();

    this.authService.resetPassword({ email, resetCode, newPassword: password }).subscribe({
      next: () => {
        this.resetSuccess.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        const serverErrors = err?.error?.errors as Record<string, string[]> | undefined;
        const serverMessage = serverErrors ? Object.values(serverErrors).flat()[0] : undefined;
        this.error.set(serverMessage ?? 'Password reset failed. Please ensure your code is valid and not expired.');
        this.loading.set(false);
      }
    });
  }
}
