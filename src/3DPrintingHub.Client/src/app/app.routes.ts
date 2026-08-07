import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { FilamentsPageComponent } from './features/filaments/pages/filaments-page.component';

export const routes: Routes = [
  { path: 'filaments', component: FilamentsPageComponent },
  { path: '', redirectTo: 'filaments', pathMatch: 'full' }
];

