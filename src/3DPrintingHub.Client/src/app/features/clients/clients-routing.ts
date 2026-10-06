import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/clients-page.component').then(module => module.ClientsPageComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/client-detail-page.component').then(module => module.ClientDetailPageComponent)
  }
];
