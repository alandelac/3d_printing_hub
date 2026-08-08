import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: HttpParams | Record<string, any>): Observable<T> {
    return this.http.get<T>(this.formatUrl(path), { params });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.formatUrl(path), body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.formatUrl(path), body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.formatUrl(path));
  }

  /**
   * Garantiza que la combinación de baseUrl y path no tenga barras diagonales dobles (//)
   */
  private formatUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }
}