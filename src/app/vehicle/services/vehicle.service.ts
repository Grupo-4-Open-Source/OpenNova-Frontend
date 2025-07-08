import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Vehicle} from '../../publications/model/vehicle.entity';
import { BaseService} from '../../shared/services/base.service';
import { environment } from '../../../environments/environment';
import { PublicationService} from '../../publications/services/publication.service';

@Injectable({
  providedIn: 'root'
})
export class VehicleService extends BaseService<Vehicle> {
  constructor(
    http: HttpClient,
    private publicationService: PublicationService
  ) {
    super(http);
    this.resourceEndpoint = environment.vehiclesEndpointPath;
  }

  /**
   * Obtiene todos los vehículos desde el backend.
   * @param params Parámetros HTTP opcionales para filtrar.
   * @returns Un Observable que emite un array de objetos Vehicle.
   */
  getAllVehicles(params?: HttpParams): Observable<Vehicle[]> {
    return this.getAll(params).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al cargar todos los vehículos:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un vehículo específico por su ID.
   * @param id El ID del vehículo (ahora number).
   * @returns Un Observable que emite el objeto Vehicle, o undefined si no se encuentra o hay un error.
   */
  getVehicleById(id: number): Observable<Vehicle | undefined> {
    return this.getById(id).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al cargar vehículo ${id}:`, err);
        return of(undefined);
      })
    );
  }

  /**
   * Crea un nuevo vehículo en el backend.
   * El 'item' debe coincidir con la estructura de CreateVehicleResource del backend.
   * El ID es generado por el backend, no se envía desde el frontend.
   * @param vehicle Los datos del vehículo a crear (sin el ID).
   * @returns Un Observable que emite el objeto Vehicle creado.
   */
  createVehicle(vehicle: Omit<Vehicle, 'id'>): Observable<Vehicle> {
    return this.create(vehicle).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al crear vehículo:', err);
        throw err;
      })
    );
  }

  /**
   * Actualiza un vehículo existente.
   * @param id El ID del vehículo a actualizar (ahora number).
   * @param vehicle Los datos actualizados del vehículo.
   * @returns Un Observable que emite el objeto Vehicle actualizado.
   */
  updateVehicle(id: number, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.update(id, vehicle).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al actualizar vehículo ${id}:`, err);
        throw err;
      })
    );
  }

  /**
   * Elimina un vehículo por su ID.
   * @param id El ID del vehículo a eliminar (ahora number).
   * @returns Un Observable que emite la respuesta de la eliminación.
   */
  deleteVehicle(id: number): Observable<any> {
    return this.delete(id).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al eliminar vehículo ${id}:`, err);
        throw err;
      })
    );
  }

  /**
   * Obtiene todos los vehículos que no han sido publicados aún.
   * Esto se logra obteniendo todos los vehículos y luego filtrando los IDs de vehículos publicados.
   * @returns Un Observable que emite un array de objetos Vehicle no publicados.
   */
  getUnpublishedVehicles(): Observable<Vehicle[]> {
    return forkJoin({
      allVehicles: this.getAllVehicles(),
      publishedVehicleIds: this.publicationService.getPublishedVehicleIds()
    }).pipe(
      map(results => {
        const publishedVehicleIds = new Set(results.publishedVehicleIds);
        return results.allVehicles.filter(vehicle => !publishedVehicleIds.has(vehicle.id));
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Error al obtener vehículos no publicados:', err);
        return of([]);
      })
    );
  }
}
