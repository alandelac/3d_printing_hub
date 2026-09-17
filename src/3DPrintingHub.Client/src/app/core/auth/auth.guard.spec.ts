import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  const router = { createUrlTree: vi.fn() } as unknown as Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => true } },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows navigation when the user is authenticated', () => {
    const route = {} as any;
    const state = {} as any;

    TestBed.runInInjectionContext(() => {
      expect(authGuard(route, state)).toBe(true);
    });
  });

  it('redirects to login when there is no session', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => false } },
        { provide: Router, useValue: router },
      ],
    });

    const route = {} as any;
    const state = {} as any;
    const tree = new UrlTree();
    vi.mocked(router.createUrlTree).mockReturnValue(tree);

    TestBed.runInInjectionContext(() => {
      const result = authGuard(route, state);
      expect(result).toBe(tree);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    });
  });
});
