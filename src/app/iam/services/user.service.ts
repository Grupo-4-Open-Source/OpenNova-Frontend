import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService} from '../../shared/services/base.service';
import { User} from '../model/user.entity';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<User> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = environment.usersEndpointPath;
  }

  getAllUsers(params?: HttpParams): Observable<User[]> {
    return this.getAll(params).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al cargar todos los usuarios:', err);
        return of([]);
      })
    );
  }

  getUserById(id: string): Observable<User | undefined> {
    return this.getById(id).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al cargar usuario ${id}:`, err);
        return of(undefined);
      })
    );
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.create(user).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al crear usuario:', err);
        throw err;
      })
    );
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.update(id, user).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al actualizar usuario ${id}:`, err);
        throw err;
      })
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.delete(id).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al eliminar usuario ${id}:`, err);
        throw err;
      })
    );
  }
}
