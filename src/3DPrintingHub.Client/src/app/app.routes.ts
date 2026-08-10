import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { FilamentsPageComponent } from './features/filaments/pages/filaments-page.component';
import { ModelsPageComponent } from './features/models/pages/models-page.component';

export const routes: Routes = [
  { path: 'filaments', component: FilamentsPageComponent },
  { path: 'models', component: ModelsPageComponent },
  { path: '', redirectTo: 'filaments', pathMatch: 'full' }
];

