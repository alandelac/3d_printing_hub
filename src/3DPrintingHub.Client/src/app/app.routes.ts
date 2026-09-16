import { Routes } from '@angular/router';
import { DashboardPageComponent } from './features/dashboard/pages/dashboard-page.component';
import { authGuard } from './core/auth/auth.guard';
import { LoginPageComponent } from './features/auth/pages/login-page.component';
import { FilamentsPageComponent } from './features/filaments/pages/filaments-page.component';
import { ModelsPageComponent } from './features/models/pages/models-page.component';
import { SettingsPageComponent } from './features/settings/pages/settings-page.component';
import { StockedPageComponent } from './features/stocked/pages/stocked-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'filaments', component: FilamentsPageComponent, canActivate: [authGuard] },
  { path: 'models', component: ModelsPageComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsPageComponent, canActivate: [authGuard] },
  { path: 'stocked', component: StockedPageComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];


