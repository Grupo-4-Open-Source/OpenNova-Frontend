import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment'; 

export class BaseService<T> {
  protected http: HttpClient;
  protected resourceEndpoint: string;
  protected basePath: string = environment.serverBasePath;
  protected httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(http: HttpClient) {
    this.http = http;
    this.resourceEndpoint = ''; // Debe ser inicializado por las clases hijas
  }

  protected resourcePath(): string {
    return `${this.basePath}/${this.resourceEndpoint}`;
  }

  // Métodos CRUD existentes
  protected handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

  getAll(params?: HttpParams): Observable<T[]> {
    return this.http.get<T[]>(this.resourcePath(), { ...this.httpOptions, params: params })
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  getById(id: number | string): Observable<T | undefined> {
    return this.http.get<T>(`${this.resourcePath()}/${id}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  create(item: any): Observable<T> {
    return this.http.post<T>(this.resourcePath(), JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  update(id: number | string, item: any): Observable<T> {
    return this.http.put<T>(`${this.resourcePath()}/${id}`, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.resourcePath()}/${id}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
}
