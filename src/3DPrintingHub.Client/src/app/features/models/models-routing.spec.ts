import { routes } from './models-routing';

describe('models routes', () => {
  it('maps the feature root to the models page', () => {
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('');
    expect(routes[0].loadComponent).toBeDefined();
  });
});
