import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/print-jobs-page.component').then(module => module.PrintJobsPageComponent)
  }
];
