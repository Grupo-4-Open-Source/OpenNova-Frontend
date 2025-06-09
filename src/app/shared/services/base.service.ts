import { Injectable } from '@angular/core';

import { environment } from "../../../environments/environment";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http"; // <--- Add HttpParams here
import { catchError, Observable, retry, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BaseService<T> {

  basePath: string = `${environment.serverBasePath}`;
  resourceEndpoint: string = '/resources';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
    })
  }

  constructor(private http: HttpClient) {  }
  handleError(error: HttpErrorResponse) {
    // Default error handling
    if (error.error instanceof ErrorEvent) {
      console.error(`An error occurred: ${error.error.message}`);
    } else {
      // Unsuccessful Response Error Code returned from Backend
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
    return throwError(() => new Error('Something happened with request, please try again later'));
  }

  // Create Resource
  create(item: any): Observable<T> {
    return this.http.post<T>(this.resourcePath(), JSON.stringify(item), this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  // Delete Resource
  delete(id: any) {
    return this.http.delete(`${this.resourcePath()}/${id}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  // Update Resource
  update(id: any, item: any): Observable<T> {
    return this.http.put<T>(`${this.resourcePath()}/${id}`, JSON.stringify(item), this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  getById(id: any): Observable<T> {
    return this.http.get<T>(`${this.resourcePath()}/${id}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  // Get All Resources
  getAll(params?: HttpParams): Observable<T[]> {
    return this.http.get<T[]>(this.resourcePath(), { ...this.httpOptions, params: params })
      .pipe(retry(2), catchError(this.handleError));
  }

  private resourcePath(): string {
    return `${this.basePath}${this.resourceEndpoint}`;
  }
}
