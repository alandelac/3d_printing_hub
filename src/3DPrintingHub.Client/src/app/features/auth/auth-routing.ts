import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', /* c8 ignore next */ loadComponent: () => import('./pages/login-page.component').then(module => module.LoginPageComponent) },
  { path: 'register', /* c8 ignore next */ loadComponent: () => import('./pages/register-page.component').then(module => module.RegisterPageComponent) },
  { path: 'forgot-password', /* c8 ignore next */ loadComponent: () => import('./pages/forgot-password-page.component').then(module => module.ForgotPasswordPageComponent) },
  { path: 'reset-password', /* c8 ignore next */ loadComponent: () => import('./pages/reset-password-page.component').then(module => module.ResetPasswordPageComponent) }
];
