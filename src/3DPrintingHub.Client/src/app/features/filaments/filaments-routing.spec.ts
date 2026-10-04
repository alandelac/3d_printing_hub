import { routes } from './filaments-routing';

describe('filaments routes', () => {
  it('maps the feature root to the filaments page', () => {
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('');
    expect(routes[0].loadComponent).toBeDefined();
  });
});
