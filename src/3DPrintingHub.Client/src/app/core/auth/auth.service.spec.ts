import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, LoginResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: { navigate: vi.fn() } }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('logs in and stores tokens', () => {
    const credentials: LoginRequest = { email: 'user@example.com', password: 'secret' };
    const response: LoginResponse = {
      tokenType: 'Bearer',
      accessToken: 'access-token',
      expiresIn: 3600,
      refreshToken: 'refresh-token',
    };

    service.login(credentials).subscribe();

    const req = httpMock.expectOne('http://localhost:5033/login');
    expect(req.request.method).toBe('POST');
    req.flush(response);

    expect(sessionStorage.getItem('3dprintinghub.accessToken')).toBe('access-token');
    expect(sessionStorage.getItem('3dprintinghub.refreshToken')).toBe('refresh-token');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('registers a new user', () => {
    service.register({ email: 'new@example.com', password: 'secret' }).subscribe();

    const req = httpMock.expectOne('http://localhost:5033/register');
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('logs out and clears session data', () => {
    sessionStorage.setItem('3dprintinghub.accessToken', 'x');
    sessionStorage.setItem('3dprintinghub.refreshToken', 'y');

    service.logout();

    expect(sessionStorage.getItem('3dprintinghub.accessToken')).toBeNull();
    expect(sessionStorage.getItem('3dprintinghub.refreshToken')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('reads the saved access token', () => {
    sessionStorage.setItem('3dprintinghub.accessToken', 'saved-token');

    expect(service.getAccessToken()).toBe('saved-token');
  });
});
