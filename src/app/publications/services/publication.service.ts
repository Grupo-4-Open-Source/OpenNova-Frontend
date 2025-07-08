import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Publication } from '../model/publication.entity';
import { BaseService } from '../../shared/services/base.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicationService extends BaseService<Publication> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = environment.publicationsEndpointPath; 
  }

  /**
   * Obtiene una lista de publicaciones destacadas.
   * Asume que el backend soporta un parámetro de consulta 'isFeatured=true'.
   * O tiene un endpoint específico como /publications/featured.
   */
  getFeaturedPublications(): Observable<Publication[]> {
    // Asumiendo un endpoint GET /api/v1/publications/featured
    return this.http.get<Publication[]>(`${this.resourcePath()}/featured`, this.httpOptions).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al cargar publicaciones destacadas:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene una lista de publicaciones disponibles (status: ACTIVO).
   * Asume que el backend soporta un parámetro de consulta 'status=ACTIVO'.
   */
  getAvailablePublications(): Observable<Publication[]> {
    let params = new HttpParams().set('status', 'ACTIVO');
    return this.getAll(params).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al cargar publicaciones disponibles:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene una publicación específica por su External ID.
   * @param externalId El External ID (UUID) de la publicación (backend String).
   * @returns Un Observable que emite el objeto Publication.
   */
  getPublicationByExternalId(externalId: string): Observable<Publication | undefined> {
    return this.getById(externalId).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al cargar publicación ${externalId}:`, err);
        return of(undefined);
      })
    );
  }

  /**
   * Crea una nueva publicación.
   * @param item Los datos de Publication para crear.
   */
  createPublication(item: {
    title: string;
    description: string;
    dailyPrice: number;
    weeklyPrice: number | null;
    vehicleId: number;
    ownerId: string;
    pickupLocationId: string;
    carRules: string;
    status: string;
    isFeatured: boolean;
    availableFrom: string;
    availableUntil: string;
  }): Observable<Publication> {
    const payload = {
      ...item,
      availableFrom: new Date(item.availableFrom).toISOString(),
      availableUntil: new Date(item.availableUntil).toISOString(),
    };
    return this.create(payload).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al crear publicación:', err);
        throw err;
      })
    );
  }

  /**
   * Actualiza una publicación existente.
   * @param externalId El External ID (UUID) de la publicación (backend String).
   * @param item Los datos de Publication actualizados.
   */
  updatePublication(externalId: string, item: {
    title?: string;
    description?: string;
    dailyPrice?: number;
    weeklyPrice?: number | null;
    carRules?: string;
    status?: string;
    isFeatured?: boolean;
    availableFrom?: string;
    availableUntil?: string;
  }): Observable<Publication> {
    const payload = { ...item };
    if (item.availableFrom) payload.availableFrom = new Date(item.availableFrom).toISOString();
    if (item.availableUntil) payload.availableUntil = new Date(item.availableUntil).toISOString();

    return this.update(externalId, payload).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al actualizar publicación ${externalId}:`, err);
        throw err;
      })
    );
  }

  /**
   * Elimina una publicación por su External ID.
   * @param externalId El External ID (UUID) de la publicación (backend String).
   * @returns Un Observable que emite la respuesta de eliminación.
   */
  deletePublication(externalId: string): Observable<any> {
    return this.delete(externalId).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al eliminar publicación ${externalId}:`, err);
        throw err;
      })
    );
  }

  /**
   * Obtiene una lista de IDs de vehículos que ya están asociados a alguna publicación.
   */
  getPublishedVehicleIds(): Observable<Set<number>> {
    return this.getAll().pipe(
      map(publications => new Set(publications.map(pub => pub.vehicleId))),
      catchError((err: HttpErrorResponse) => {
        console.error('Error al obtener IDs de vehículos publicados:', err);
        return of(new Set<number>());
      })
    );
  }

  /**
   * Obtiene las publicaciones de un propietario específico por su ownerId.
   * Asume endpoint backend como GET /publications/owner/{ownerId}.
   */
  getPublicationsByOwnerId(ownerId: string): Observable<Publication[]> {
    return this.http.get<Publication[]>(
      `${this.resourcePath()}/owner/${ownerId}`,
      this.httpOptions
    ).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error loading publications for owner ${ownerId}:`, err);
        return of([]);
      })
    );
  }

  /**
   * Verifica la disponibilidad de una publicación.
   * @param externalId El External ID (UUID) de la publicación (backend String).
   * @param startDate Fecha de inicio en formato 'YYYY-MM-DD'.
   * @param endDate Fecha de fin en formato 'YYYY-MM-DD'.
   */
  isPublicationAvailable(externalId: string, startDate: string, endDate: string): Observable<boolean> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<boolean>(
      `${this.resourcePath()}/${externalId}/availability`,
      { ...this.httpOptions, params: params }
    ).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error checking availability for publication ${externalId}:`, err);
        return of(false);
      })
    );
  }
}
