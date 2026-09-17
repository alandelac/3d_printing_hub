import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly identityUrl = environment.apiUrl.replace(/\/api\/?$/, '');
  private readonly accessTokenKey = '3dprintinghub.accessToken';
  private readonly refreshTokenKey = '3dprintinghub.refreshToken';

  readonly isAuthenticated = signal(this.hasAccessToken());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.identityUrl}/login`, credentials).pipe(
      tap(response => {
        sessionStorage.setItem(this.accessTokenKey, response.accessToken);
        sessionStorage.setItem(this.refreshTokenKey, response.refreshToken);
        this.isAuthenticated.set(true);
      })
    );
  }

  register(payload: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.identityUrl}/register`, payload);
  }

  logout(): void {
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    this.isAuthenticated.set(false);
    void this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.accessTokenKey);
  }

  private hasAccessToken(): boolean {
    return !!sessionStorage.getItem(this.accessTokenKey);
  }
}
