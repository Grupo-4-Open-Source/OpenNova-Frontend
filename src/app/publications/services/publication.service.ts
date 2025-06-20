import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { Publication} from '../model/publication.entity';
import { BaseService} from '../../shared/services/base.service';
import { environment } from '../../../environments/environment';

import { Vehicle} from '../model/vehicle.entity';
import { Location} from '../model/location.entity';
import { User} from '../../iam/model/user.entity';


@Injectable({
  providedIn: 'root'
})
export class PublicationService extends BaseService<Publication> {

  private vehicleBaseService: BaseService<Vehicle>;
  private locationBaseService: BaseService<Location>;
  private userBaseService: BaseService<User>;


  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = environment.publicationsEndpointPath;

    this.vehicleBaseService = new BaseService<Vehicle>(http);
    this.vehicleBaseService.resourceEndpoint = environment.vehiclesEndpointPath;

    this.locationBaseService = new BaseService<Location>(http);
    this.locationBaseService.resourceEndpoint = environment.locationsEndpointPath;

    this.userBaseService = new BaseService<User>(http);
    this.userBaseService.resourceEndpoint = environment.usersEndpointPath;
  }

  /**
   * Helper method to enrich a Publication with complete Vehicle, Owner, and Location objects.
   * @param publicacion The raw Publication object obtained from the backend.
   * @returns An Observable that emits the enriched Publication object.
   */
  private enrichPublication(publicacion: Publication): Observable<Publication> {
    const observables: { vehicle?: Observable<Vehicle | undefined>, owner?: Observable<User | undefined>, pickupLocation?: Observable<Location | undefined> } = {};

    if (publicacion.vehicleId && !publicacion.vehicle) {
      observables.vehicle = this.vehicleBaseService.getById(publicacion.vehicleId).pipe(
        catchError(() => of(undefined))
      );
    } else {
      observables.vehicle = of(publicacion.vehicle);
    }

    if (publicacion.ownerId && !publicacion.owner) {
      observables.owner = this.userBaseService.getById(publicacion.ownerId).pipe(
        catchError(() => of(undefined))
      );
    } else {
      observables.owner = of(publicacion.owner);
    }

    if (publicacion.pickupLocationId && !publicacion.pickupLocation) {
      observables.pickupLocation = this.locationBaseService.getById(publicacion.pickupLocationId).pipe(
        catchError(() => of(undefined))
      );
    } else {
      observables.pickupLocation = of(publicacion.pickupLocation);
    }

    return forkJoin(observables).pipe(
      map(results => {
        return {
          ...publicacion,
          vehicle: results.vehicle ?? publicacion.vehicle,
          owner: results.owner ?? publicacion.owner,
          pickupLocation: results.pickupLocation ?? publicacion.pickupLocation
        };
      }),
      catchError(err => {
        console.error(`Error enriching publicacion ${publicacion.id}:`, err);
        return of(publicacion);
      })
    );
  }

  /**
   * Obtiene una lista de publicaciones destacadas y activas.
   * Aplica los parámetros _expand directamente para json-server.
   * @returns Un Observable que emite un array de objetos Publicacion enriquecidos.
   */
  getFeaturedPublications(): Observable<Publication[]> {
    let params = new HttpParams()
      .set('isFeatured', 'true')
      .set('status', 'ACTIVO');
    params = params.append('_expand', 'vehicle');
    params = params.append('_expand', 'owner');
    params = params.append('_expand', 'pickupLocation');

    return this.getAll(params).pipe(
      switchMap((rawPublicaciones: Publication[]) => {
        if (rawPublicaciones.length === 0) {
          return of([]);
        }
        const enrichmentObservables = rawPublicaciones.map(pub => this.enrichPublication(pub));
        return forkJoin(enrichmentObservables);
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Error al cargar publicaciones destacadas:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene una lista de publicaciones disponibles (activas).
   * @param limit Cantidad máxima de publicaciones a obtener.
   * @returns Un Observable que emite un array de objetos Publicacion enriquecidos.
   */
  getAvailablePublications(limit?: number): Observable<Publication[]> {
    let params = new HttpParams()
      .set('status', 'ACTIVO');
    if (limit) {
      params = params.set('_limit', limit.toString());
    }
    params = params.append('_expand', 'vehicle');
    params = params.append('_expand', 'owner');
    params = params.append('_expand', 'pickupLocation');

    return this.getAll(params).pipe(
      switchMap((rawPublicaciones: Publication[]) => {
        if (rawPublicaciones.length === 0) {
          return of([]);
        }
        const enrichmentObservables = rawPublicaciones.map(pub => this.enrichPublication(pub));
        return forkJoin(enrichmentObservables);
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Error al cargar publicaciones disponibles:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene una publicación específica por su ID, enriquecida con los detalles de vehículo, propietario y ubicación.
   * @param id El ID de la publicación.
   * @returns Un Observable que emite el objeto Publicacion enriquecido, o undefined si no se encuentra o hay un error.
   */
  getPublicationById(id: string): Observable<Publication | undefined> {
    return this.getById(id).pipe(
      switchMap((rawPublicacion: Publication | undefined) => {
        if (!rawPublicacion) {
          return of(undefined);
        }
        return this.enrichPublication(rawPublicacion);
      }),
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al cargar publicación ${id}:`, err);
        return of(undefined);
      })
    );
  }

  /**
   * Creates a new publication in the backend.
   * @param item The Publicacion data to create (expected to include all fields the backend needs, including generated ID and IDs for relationships).
   * @returns An Observable that emits the created Publicacion object.
   */
  createPublication(item: Publication): Observable<Publication> {
    return this.create(item).pipe(
      map((createdPublicacion: Publication) => createdPublicacion),
      catchError((err: HttpErrorResponse) => {
        console.error('Error al crear publicación:', err);
        throw err;
      })
    );
  }

  /**
   * Obtiene una lista de IDs de vehículos que ya están asociados a alguna publicación.
   * @returns Un Observable que emite un Set de IDs de vehículos publicados.
   */
  getPublishedVehicleIds(): Observable<Set<string>> {
    return this.getAll().pipe(
      map(publicaciones => new Set(publicaciones.map(pub => pub.vehicleId))),
      catchError((err: HttpErrorResponse) => {
        console.error('Error al obtener IDs de vehículos publicados:', err);
        return of(new Set<string>());
      })
    );
  }

  getPublicationsByOwnerId(ownerId: string): Observable<Publication[]> {
    let params = new HttpParams().set('ownerId', ownerId);
    params = params.append('_expand', 'vehicle');
    params = params.append('_expand', 'pickupLocation');

    return this.getAll(params).pipe(
      switchMap((rawPublications: Publication[]) => {
        if (rawPublications.length === 0) {
          return of([]);
        }
        const enrichmentObservables = rawPublications.map(pub => this.enrichPublication(pub));
        return forkJoin(enrichmentObservables);
      }),
      catchError((err: HttpErrorResponse) => {
        console.error(`Error loading publications for owner ${ownerId}:`, err);
        return of([]);
      })
    );
  }
}
