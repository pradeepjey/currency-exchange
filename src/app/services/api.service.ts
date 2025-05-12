// api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  /**
   * GET request
   * @param endpoint Endpoint to hit
   * @param params Query parameters
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = this.createHttpParams(params);
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * POST request
   * @param endpoint Endpoint to hit
   * @param body Request body
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * PUT request
   * @param endpoint Endpoint to hit
   * @param body Request body
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * DELETE request
   * @param endpoint Endpoint to hit
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Convert object to HttpParams
   * @param params Object with key-value pairs
   */
  private createHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.append(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }

  /**
   * Handle HTTP errors
   * @param error HttpErrorResponse
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}