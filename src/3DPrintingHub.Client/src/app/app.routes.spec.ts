import { authGuard } from './core/auth/auth.guard';
import { routes } from './app.routes';

describe('app routes', () => {
  it('lazy-loads each feature and keeps protected routes guarded', () => {
    const protectedPaths = ['clients', 'dashboard', 'filaments', 'models', 'settings', 'stocked'];
    const protectedRoutes = routes.filter(route => protectedPaths.includes(route.path ?? ''));

    expect(protectedRoutes).toHaveLength(protectedPaths.length);
    expect(protectedRoutes.every(route => route.loadChildren && route.canActivate?.includes(authGuard))).toBe(true);
    expect(routes.filter(route => route.path === '' && route.loadChildren)).toHaveLength(1);
    expect(routes.find(route => route.path === '' && route.redirectTo)).toEqual({
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    });
  });
});
