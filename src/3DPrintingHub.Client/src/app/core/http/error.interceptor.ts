import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log detailed error information
      console.group(`❌ HTTP Error: ${req.method} ${req.urlWithParams}`);
      console.error('Status:', error.status);
      console.error('Status Text:', error.statusText);
      console.error('Message:', error.message);
      console.error('Error Body:', error.error);
      
      // Parse error for specific error types
      if (error.error) {
        if (typeof error.error === 'object') {
          // Check for validation errors (ASP.NET Core style)
          if (error.error.errors) {
            console.error('Validation Errors:', error.error.errors);
            console.group('Validation Details');
            Object.entries(error.error.errors).forEach(([field, messages]) => {
              console.error(`${field}:`, messages);
            });
            console.groupEnd();
          }
          // Check for required field errors
          if (error.error.detail) {
            console.error('Detail:', error.error.detail);
          }
          // Check for custom error messages
          if (error.error.title) {
            console.error('Title:', error.error.title);
          }
        } else if (typeof error.error === 'string') {
          console.error('Error String:', error.error);
        }
      }
      
      // Network or CORS errors
      if (error.status === 0) {
        console.error('Network Error or CORS issue - Check if backend is running and CORS is configured');
      }
      
      // Server errors (5xx)
      if (error.status >= 500 && error.status < 600) {
        console.error('Server Error (5xx) - Check backend logs');
      }
      
      // Client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        switch (error.status) {
          case 400:
            console.error('Bad Request (400) - Invalid request data');
            break;
          case 401:
            console.error('Unauthorized (401) - Authentication required');
            break;
          case 403:
            console.error('Forbidden (403) - Insufficient permissions');
            break;
          case 404:
            console.error('Not Found (404) - Resource does not exist');
            break;
          case 422:
            console.error('Unprocessable Entity (422) - Validation failed');
            break;
        }
      }
      
      console.groupEnd();
      
      // Re-throw the error so components can still handle it
      return throwError(() => error);
    })
  );
};