import { routes } from './dashboard-routing';

describe('dashboard routes', () => {
  it('maps the feature root to the dashboard page', () => {
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('');
    expect(routes[0].loadComponent).toBeDefined();
  });
});
