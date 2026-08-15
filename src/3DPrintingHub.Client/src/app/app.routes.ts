import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { DashboardPageComponent } from './features/dashboard/pages/dashboard-page.component';
import { FilamentsPageComponent } from './features/filaments/pages/filaments-page.component';
import { ModelsPageComponent } from './features/models/pages/models-page.component';
import { SettingsPageComponent } from './features/settings/pages/settings-page.component';
import { StockedPageComponent } from './features/stocked/pages/stocked-page.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'filaments', component: FilamentsPageComponent },
  { path: 'models', component: ModelsPageComponent },
  { path: 'settings', component: SettingsPageComponent },
  { path: 'stocked', component: StockedPageComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];


