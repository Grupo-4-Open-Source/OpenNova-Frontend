import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService} from '../../shared/services/base.service';
import { Location} from '../model/location.entity';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService extends BaseService<Location> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = environment.locationsEndpointPath;
  }

  /**
   * Obtiene todas las ubicaciones disponibles desde el backend.
   * @param params Parámetros HTTP opcionales para filtrar.
   * @returns Un Observable que emite un array de objetos Location.
   */
  getAllLocations(params?: HttpParams): Observable<Location[]> {
    return this.getAll(params).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al cargar todas las ubicaciones:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene una ubicación específica por su ID.
   * @param id El ID de la ubicación.
   * @returns Un Observable que emite el objeto Location, o undefined si no se encuentra o hay un error.
   */
  getLocationById(id: string): Observable<Location | undefined> {
    return this.getById(id).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al cargar ubicación ${id}:`, err);
        return of(undefined);
      })
    );
  }

  /**
   * Crea una nueva ubicación.
   * @param item Los datos de la ubicación a crear (sin el ID).
   * @returns Un Observable que emite el objeto Location creado.
   */
  createLocation(item: Omit<Location, 'id'>): Observable<Location> {
    return this.create(item).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al crear ubicación:', err);
        throw err;
      })
    );
  }

  /**
   * Actualiza una ubicación existente.
   * @param id El ID de la ubicación a actualizar.
   * @param item Los datos actualizados de la ubicación.
   * @returns Un Observable que emite el objeto Location actualizado.
   */
  updateLocation(id: string, item: Partial<Location>): Observable<Location> {
    return this.update(id, item).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al actualizar ubicación ${id}:`, err);
        throw err;
      })
    );
  }

  /**
   * Elimina una ubicación por su ID.
   * @param id El ID de la ubicación a eliminar.
   * @returns Un Observable que emite la respuesta de la eliminación.
   */
  deleteLocation(id: string): Observable<any> {
    return this.delete(id).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al eliminar ubicación ${id}:`, err);
        throw err;
      })
    );
  }
}
