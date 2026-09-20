import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '', /* c8 ignore next */ loadChildren: () => import('./features/auth/auth-routing').then(module => module.routes) },
  { path: 'dashboard', canActivate: [authGuard], /* c8 ignore next */ loadChildren: () => import('./features/dashboard/dashboard-routing').then(module => module.routes) },
  { path: 'filaments', canActivate: [authGuard], /* c8 ignore next */ loadChildren: () => import('./features/filaments/filaments-routing').then(module => module.routes) },
  { path: 'models', canActivate: [authGuard], /* c8 ignore next */ loadChildren: () => import('./features/models/models-routing').then(module => module.routes) },
  { path: 'settings', canActivate: [authGuard], /* c8 ignore next */ loadChildren: () => import('./features/settings/settings-routing').then(module => module.routes) },
  { path: 'stocked', canActivate: [authGuard], /* c8 ignore next */ loadChildren: () => import('./features/stocked/stocked-routing').then(module => module.routes) },
];


