import { routes } from './settings-routing';

describe('settings routes', () => {
  it('maps the feature root to the settings page', () => {
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('');
    expect(routes[0].loadComponent).toBeDefined();
  });
});
