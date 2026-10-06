import { routes } from './sales-routing';

describe('sales routes', () => {
  it('maps the feature root to the sales page', () => {
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('');
    expect(routes[0].loadComponent).toBeDefined();
  });
});
