# Arquitectura Frontend Angular - Clean Architecture

Esta guía describe la estructura recomendada para `src/app` de tu aplicación Angular, siguiendo una filosofía similar a Clean Architecture.

## Estructura propuesta

```txt
src/app/
├── core/
│   ├── auth/
│   │   ├── auth.guard.ts
│   │   ├── auth.service.ts
│   │   └── auth.model.ts
│   ├── http/
│   │   ├── api-client.ts
│   │   ├── api.config.ts
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── layout/
│   │   ├── default-layout.component.ts
│   │   ├── public-layout.component.ts
│   │   └── layout.module.ts
│   └── ui/
│       ├── button/
│       │   ├── button.component.ts
│       │   ├── button.component.html
│       │   └── button.component.css
│       ├── input/
│       │   ├── input.component.ts
│       │   ├── input.component.html
│       │   └── input.component.css
│       └── modal/
│           ├── modal.component.ts
│           ├── modal.component.html
│           └── modal.component.css
├── domain/
│   └── models/
│       ├── filament-color.model.ts
│       ├── filament.model.ts
│       └── user.model.ts
├── data/
│   ├── api/
│   │   ├── api-client.ts
│   │   └── api.config.ts
│   └── repositories/
│       ├── filament.repository.ts
│       └── auth.repository.ts
└── features/
    ├── filaments/
    │   ├── components/
    │   │   ├── colors-modal/
    │   │   │   ├── colors-modal.component.ts
    │   │   │   ├── colors-modal.component.html
    │   │   │   └── colors-modal.component.css
    │   │   └── filament-card/
    │   │       ├── filament-card.component.ts
    │   │       ├── filament-card.component.html
    │   │       └── filament-card.component.css
    │   ├── pages/
    │   │   ├── filaments-page.component.ts
    │   │   ├── filaments-page.component.html
    │   │   └── filaments-page.component.css
    │   └── filaments-routing.ts
    └── auth/
        ├── login-page.component.ts
        └── register-page.component.ts
```

## 1. Core / Shared (Global)

Elementos transversales que usa toda la aplicación.

- `core/auth/`
  - Guards de autenticación
  - Servicios de auth global
  - Modelos de sesión y usuario si son cross-cutting
- `core/http/`
  - Cliente HTTP genérico (`api-client.ts`)
  - Configuración de base URL o providers
  - Interceptores de token y de errores
- `core/layout/`
  - Layouts globales usados por páginas públicas y protegidas
- `core/ui/`
  - Componentes reutilizables ligeros: botones, inputs, modales, badges, spinners

### Regla

Si un elemento se usa en más de una feature, debe estar en `core/`.

## 2. Dominio / Modelos

Sólo definiciones de TypeScript que representan tus entidades.

- `domain/models/filament-color.model.ts`
- `domain/models/filament.model.ts`
- `domain/models/user.model.ts`

Los modelos deben coincidir con el contrato de la API.

### Ejemplo

```ts
export interface FilamentColor {
  id: string;
  color: string;
  colorCode: string;
}
```

## 3. Data / Repositorios (Data Access)

Servicios inyectables que se comunican con la API HTTP.

- `data/api/api-client.ts`: cliente genérico que define la base URL, headers, y métodos `get`, `post`, `put`, `delete`.
- `data/repositories/filament.repository.ts`: métodos específicos de filamentos.

### Ejemplo de `api-client.ts`

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly baseUrl = 'http://localhost:5033/api';

  constructor(private http: HttpClient) {}

  get<T>(path: string) {
    return this.http.get<T>(`${this.baseUrl}${path}`);
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }
}
```

### Ejemplo de `filament.repository.ts`

```ts
import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { FilamentColor } from '../../domain/models/filament-color.model';

@Injectable({ providedIn: 'root' })
export class FilamentRepository {
  constructor(private api: ApiClient) {}

  getColors() {
    return this.api.get<FilamentColor[]>('/filamentcolors');
  }

  createColor(payload: { color: string; colorCode: string }) {
    return this.api.post('/filamentcolors', payload);
  }
}
```

## 4. Features / Pages

Agrupa por dominios de negocio, cada uno con su propio espacio.

- `features/filaments/`
- `features/auth/`
- `features/marketplaces/`

Dentro de cada feature:
- `pages/`: vistas completas
- `components/`: subcomponentes específicos de esa feature
- `routing`: rutas internas, si usas lazy loading

### Ejemplo de componente tonto

```ts
@Component({
  selector: 'app-colors-modal',
  templateUrl: './colors-modal.component.html',
})
export class ColorsModalComponent {
  @Input() colors: FilamentColor[] = [];
  @Output() addColor = new EventEmitter<{ color: string; colorCode: string }>();

  name = '';
  code = '#FFFFFF';

  onAdd() {
    this.addColor.emit({ color: this.name, colorCode: this.code });
  }
}
```

### Ejemplo de página / feature

```ts
@Component({
  selector: 'app-filaments-page',
  templateUrl: './filaments-page.component.html',
})
export class FilamentsPageComponent {
  colors$ = this.filamentRepository.getColors();

  constructor(private filamentRepository: FilamentRepository) {}

  addColor(dto: { color: string; colorCode: string }) {
    this.filamentRepository.createColor(dto)
      .pipe(switchMap(() => this.filamentRepository.getColors()))
      .subscribe();
  }
}
```

## Regla importante

- `componentes` deben ser responsables de la UI.
- `servicios/repositories` deben ser responsables de la lógica de datos.
- Nunca mezcles URLs ni llamadas HTTP dentro de una vista.
- Usa `domain/models` como contrato único entre frontend y backend.

## Resumen rápido

- `core/` = utilidades globales y componentes compartidos
- `domain/` = tipos y modelos
- `data/` = acceso a datos, HTTP, repositorios
- `features/` = lógica y UI específica de cada dominio

## Cómo consultar cuando te olvides

1. ¿Es reutilizable por varias features? → `core/`
2. ¿Es sólo un tipo / interface? → `domain/models/`
3. ¿Es llamada HTTP o datos? → `data/`
4. ¿Es una página o componente específico de negocio? → `features/`

Mantén esta guía en `src/app/ARCHITECTURE.md` para que puedas consultarla siempre.
