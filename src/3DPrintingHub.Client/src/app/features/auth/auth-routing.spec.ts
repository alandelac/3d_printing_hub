import { routes } from './auth-routing';

describe('auth routes', () => {
  it('keeps login and register public', () => {
    expect(routes.map(route => route.path)).toEqual(['login', 'register']);
    expect(routes.every(route => route.loadComponent)).toBe(true);
    expect(routes.every(route => !route.canActivate)).toBe(true);
  });
});
