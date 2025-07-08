import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Eliminamos forkJoin, map, switchMap para simplificar
import { catchError } from 'rxjs/operators';

import { Rental} from '../model/rental.entity';
import { BaseService} from '../../shared/services/base.service';
import { environment } from '../../../environments/environment';
import { PublicationService} from '../../publications/services/publication.service';
import { UserService} from '../../iam/services/user.service';
import { InsuranceService } from './insurance.service';
import { LocationService} from '../../publications/services/location.service';


@Injectable({
  providedIn: 'root'
})
export class RentalService extends BaseService<Rental> {

  constructor(
    http: HttpClient,
    private publicationService: PublicationService,
    private userService: UserService,
    private insuranceService: InsuranceService,
    private locationService: LocationService
  ) {
    super(http);
    this.resourceEndpoint = environment.rentalsEndpointPath;
  }

  /**
   * Obtiene todos los alquileres desde el backend.
   * @param params Parámetros HTTP opcionales para filtrar.
   * @returns Un Observable que emite un array de objetos Rental.
   */
  getAllRentals(params?: HttpParams): Observable<Rental[]> {
    // No hay necesidad de añadir _expand aquí. El backend devuelve RentalResource.
    return this.getAll(params).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al cargar todos los alquileres:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un alquiler específico por su ID.
   * @param id El ID del alquiler (number).
   * @returns Un Observable que emite un objeto Rental.
   */
  getRentalById(id: number): Observable<Rental | undefined> { // ID como number
    return this.getById(id).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al cargar alquiler ${id}:`, err);
        return of(undefined);
      })
    );
  }

  /**
   * Crea un nuevo alquiler.
   * El 'item' debe coincidir con la estructura de CreateRentalCommand del backend.
   * Las fechas deben enviarse como cadenas ISO 8601.
   * @param item Los datos del alquiler a crear (sin el ID).
   * @returns Un Observable que emite la instancia de Rental creada.
   */
  createRental(item: Omit<Rental, 'id' | 'totalCost' | 'baseCost' | 'insuranceCost' | 'platformCommission' | 'dropoffMileage' | 'status'>): Observable<Rental> {
    const payload = {
      ...item,
      bookingDate: new Date(item.bookingDate).toISOString(),
      startDate: new Date(item.startDate).toISOString(),
      endDate: new Date(item.endDate).toISOString(),
    };
    return this.create(payload).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error al crear alquiler:', err);
        throw err;
      })
    );
  }

  /**
   * Actualiza un alquiler existente.
   * El 'item' debe coincidir con la estructura de UpdateRentalCommand del backend.
   * Las fechas deben enviarse como cadenas ISO 8601.
   * @param id El ID del alquiler a actualizar (number).
   * @param item Los datos actualizados del alquiler.
   * @returns Un Observable que emite la instancia de Rental actualizada.
   */
  updateRental(id: number, item: Partial<Rental>): Observable<Rental> { // ID como number
    const payload = { ...item };
    // Asegúrate de que si las fechas se actualizan, se envíen como ISO strings
    if (item.startDate) payload.startDate = new Date(item.startDate).toISOString();
    if (item.endDate) payload.endDate = new Date(item.endDate).toISOString();
    if (item.bookingDate) payload.bookingDate = new Date(item.bookingDate).toISOString();

    return this.update(id, payload).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al actualizar alquiler ${id}:`, err);
        throw err;
      })
    );
  }

  /**
   * Elimina un alquiler por su ID.
   * @param id El ID del alquiler a eliminar (number).
   * @returns Un Observable que emite la respuesta de la eliminación.
   */
  deleteRental(id: number): Observable<any> { // ID como number
    return this.delete(id).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al eliminar alquiler ${id}:`, err);
        throw err;
      })
    );
  }

  /**
   * Obtiene los alquileres de un usuario específico, filtrados por estado.
   * Asume que el backend tiene un endpoint como GET /rentals/renter/{renterId}?status={status}.
   * @param userId El ID del usuario (arrendatario - UUID string).
   * @param status El estado de los alquileres a filtrar ('upcoming', 'completed', 'pending', 'all').
   * @returns Un Observable que emite un array de alquileres.
   */
  getMyRentals(userId: string, status: 'upcoming' | 'completed' | 'pending' | 'all'): Observable<Rental[]> {
    let params = new HttpParams();
    if (status !== 'all') {
      params = params.set('status', status.toUpperCase()); // Convierte a mayúsculas para el enum de backend
    }

    return this.http.get<Rental[]>(
      `${this.resourcePath()}/renter/${userId}`, // Asumiendo esta ruta de endpoint en tu backend
      { ...this.httpOptions, params: params }
    ).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al obtener alquileres para el usuario ${userId} con estado ${status}:`, err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene los alquileres asociados a los vehículos de un propietario.
   * Asume que el backend tiene un endpoint como GET /rentals/owner/{ownerId}?status={status}.
   * @param ownerId El ID del propietario (UUID string).
   * @param status El estado de los alquileres a filtrar ('pending', 'upcoming', 'completed', 'all').
   * @returns Un Observable que emite un array de alquileres.
   */
  getRentalsForOwner(ownerId: string, status: 'pending' | 'upcoming' | 'completed' | 'all'): Observable<Rental[]> {
    let params = new HttpParams();
    if (status !== 'all') {
      params = params.set('status', status.toUpperCase()); // Convierte a mayúsculas para el enum de backend
    }

    return this.http.get<Rental[]>(
      `${this.resourcePath()}/owner/${ownerId}`, // Asumiendo esta ruta de endpoint en tu backend
      { ...this.httpOptions, params: params }
    ).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al cargar alquileres para el propietario ${ownerId} con estado ${status}:`, err);
        return of([]);
      })
    );
  }
}
