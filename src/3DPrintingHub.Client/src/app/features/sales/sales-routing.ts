import { Routes } from '@angular/router';

export const routes: Routes = [{
  path: '',
  /* c8 ignore next */ loadComponent: () => import('./pages/sales-page.component').then(module => module.SalesPageComponent)
}];
