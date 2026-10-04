import { Routes } from '@angular/router';

export const routes: Routes = [{
  path: '',
  loadComponent: () => import('./pages/clients-page.component').then(module => module.ClientsPageComponent)
}];
