type Glob = (pattern: string, options?: Record<string, unknown>) => Record<string, string>;

declare global {
  interface ImportMeta {
    glob: Glob;
  }
}

const featureSources = import.meta.glob('./src/app/features/**/*.ts', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

const pageFolders = import.meta.glob('./src/app/features/*/pages/**/*.ts');
const componentFolders = import.meta.glob('./src/app/features/*/components/**/*.ts');

describe('feature layering', () => {
  it('keeps HTTP and API configuration out of feature sources', () => {
    const violations = Object.entries(featureSources)
      .filter(([file]) => !file.endsWith('.spec.ts'))
      .flatMap(([file, source]) => {
        const rules = [
          { name: 'HttpClient', pattern: /\bHttpClient\b/ },
          { name: 'environment import', pattern: /environments[\\/]environment/ },
          { name: 'URL literal', pattern: /https?:\/\// },
          { name: 'localhost', pattern: /localhost/ },
          { name: 'apiUrl', pattern: /\bapiUrl\b/ }
        ];
        return rules.filter(rule => rule.pattern.test(source)).map(rule => `${file}: ${rule.name}`);
      });

    expect(violations).toEqual([]);
  });

  it('keeps the documented feature folder shape', () => {
    const expected = {
      auth: ['pages'],
      clients: ['pages', 'components'],
      dashboard: ['pages', 'components'],
      filaments: ['pages', 'components'],
      models: ['pages', 'components'],
      'print-jobs': ['pages', 'components'],
      sales: ['pages', 'components'],
      settings: ['pages', 'components'],
      stocked: ['pages', 'components']
    };

    for (const [feature, folders] of Object.entries(expected)) {
      for (const folder of folders) {
        const folderGlob = folder === 'pages' ? pageFolders : componentFolders;
        expect(Object.keys(folderGlob).some(path => path.includes(`/features/${feature}/${folder}/`))).toBe(true);
      }
    }
  });
});
