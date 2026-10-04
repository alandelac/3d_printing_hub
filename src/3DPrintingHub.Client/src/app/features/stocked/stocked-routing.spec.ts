import { routes } from './stocked-routing';

describe('stocked routes', () => {
  it('maps the feature root to the stocked page', () => {
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('');
    expect(routes[0].loadComponent).toBeDefined();
  });
});
