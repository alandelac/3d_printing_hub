import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', /* c8 ignore next */ loadComponent: () => import('./pages/login-page.component').then(module => module.LoginPageComponent) },
  { path: 'register', /* c8 ignore next */ loadComponent: () => import('./pages/register-page.component').then(module => module.RegisterPageComponent) }
];
