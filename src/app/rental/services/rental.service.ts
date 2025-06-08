import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { Rental} from '../model/rental.entity';
import { Publication} from '../../publications/model/publication.entity';
import { User} from '../../iam/model/user.entity';
import { Insurance} from '../model/insurance.entity';
import { Location} from '../../publications/model/location.entity';

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
   * Helper method to enrich an Alquiler with its complete Publicacion, Renter (User), Insurance,
   * PickupLocation, and DropoffLocation objects.
   * @param rental The raw Alquiler object obtained from the backend.
   * @returns An Observable that emits the enriched Alquiler object.
   */
  private enrichRental(rental: Rental): Observable<Rental> {
    const observables: {
      publication?: Observable<Publication | undefined>,
      renter?: Observable<User | undefined>,
      insurance?: Observable<Insurance | undefined>,
      pickupLocation?: Observable<Location | undefined>,
      dropoffLocation?: Observable<Location | undefined>
    } = {};

    if (rental.publicationId && !rental.publication) {
      observables.publication = this.publicationService.getPublicationById(rental.publicationId).pipe(
        catchError(() => of(undefined))
      );
    } else {
      observables.publication = of(rental.publication);
    }

    if (rental.renterId && !rental.renter) {
      observables.renter = this.userService.getUserById(rental.renterId).pipe(
        catchError(() => of(undefined))
      );
    } else {
      observables.renter = of(rental.renter);
    }

    if (rental.insuranceId && !rental.insurance) {
      observables.insurance = this.insuranceService.getInsuranceById(rental.insuranceId).pipe(
        catchError(() => of(undefined))
      );
    } else {
      observables.insurance = of(rental.insurance);
    }

    // Obtener PickupLocation usando LocationService
    if (rental.pickupLocationId && !rental.pickupLocation) {
      observables.pickupLocation = this.locationService.getLocationById(rental.pickupLocationId).pipe(
        catchError(() => of(undefined))
      );
    } else {
      observables.pickupLocation = of(rental.pickupLocation);
    }

    if (rental.dropoffLocationId && !rental.dropoffLocation) {
      observables.dropoffLocation = this.locationService.getLocationById(rental.dropoffLocationId).pipe(
        catchError(() => of(undefined))
      );
    } else {
      observables.dropoffLocation = of(rental.dropoffLocation);
    }

    return forkJoin(observables).pipe(
      map(results => {
        return {
          ...rental,
          publication: results.publication ?? rental.publication,
          renter: results.renter ?? rental.renter,
          insurance: results.insurance ?? rental.insurance,
          pickupLocation: results.pickupLocation ?? rental.pickupLocation,
          dropoffLocation: results.dropoffLocation ?? rental.dropoffLocation
        };
      }),
      catchError(err => {
        console.error(`Error enriching alquiler ${rental.id}:`, err);
        return of(rental);
      })
    );
  }


  /**
   * Fetches all rental agreements.
   * Aplica los parámetros _expand directamente para json-server.
   * @param params Optional HTTP parameters for filtering.
   * @returns An Observable that emits an array of Rental objects.
   */
  getAllRentals(params?: HttpParams): Observable<Rental[]> {
    let currentParams = params || new HttpParams();
    currentParams = currentParams.append('_expand', 'publication');
    currentParams = currentParams.append('_expand', 'renter');
    currentParams = currentParams.append('_expand', 'insurance');
    currentParams = currentParams.append('_expand', 'pickupLocation');
    currentParams = currentParams.append('_expand', 'dropoffLocation');


    return this.getAll(currentParams).pipe(
      switchMap((rawAlquileres: Rental[]) => {
        if (rawAlquileres.length === 0) {
          return of([]);
        }
        const enrichmentObservables = rawAlquileres.map(alquiler => this.enrichRental(alquiler));
        return forkJoin(enrichmentObservables);
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Error al cargar todos los alquileres:', err);
        return of([]);
      })
    );
  }

  /**
   * Fetches a single rental agreement by its ID.
   * @param id The ID of the rental agreement.
   * @returns An Observable that emits an Alquiler object.
   */
  getRentalById(id: string): Observable<Rental | undefined> {
    return this.getById(id).pipe(
      switchMap((rawAlquiler: Rental | undefined) => {
        if (!rawAlquiler) {
          return of(undefined);
        }
        return this.enrichRental(rawAlquiler);
      }),
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al cargar alquiler ${id}:`, err);
        return of(undefined);
      })
    );
  }

  /**
   * Creates a new rental agreement.
   * @param item The Rental object to create.
   * @returns An Observable that emits the created Rental instance.
   */
  createRental(item: Rental): Observable<Rental> {
    return this.create(item).pipe(
      map((createdAlquiler: Rental) => createdAlquiler),
      catchError((err: HttpErrorResponse) => {
        console.error('Error al crear alquiler:', err);
        throw err;
      })
    );
  }

  /**
   * Updates an existing rental agreement.
   * @param id The ID of the rental agreement to update.
   *
   * @param item The updated Rental object.
   * @returns An Observable that emits the updated Rental instance.
   */
  updateRental(id: string, item: Partial<Rental>): Observable<Rental> {
    return this.update(id, item).pipe(
      map((updatedRental: Rental) => updatedRental),
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al actualizar alquiler ${id}:`, err);
        throw err;
      })
    );
  }

  /**
   * Deletes a rental agreement by its ID.
   * @param id The ID of the rental agreement to delete.
   * @returns An Observable that emits a void response.
   */
  deleteRental(id: string): Observable<any> {
    return this.delete(id).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al eliminar alquiler ${id}:`, err);
        throw err;
      })
    );
  }

  /**
   * Obtiene los alquileres de un usuario específico, filtrados por estado.
   * @param userId El ID del usuario (arrendatario o propietario).
   * @param status El estado de los alquileres a filtrar ('upcoming', 'completed', 'pending', 'all').
   * @returns Un Observable que emite un array de Alquileres enriquecidos.
   */
  getMyRentals(userId: string, status: 'upcoming' | 'completed' | 'pending' | 'all'): Observable<Rental[]> {
    return this.getAllRentals().pipe(
      map((allAlquileres: Rental[]) => {
        let filteredAlquileres = allAlquileres.filter((alquiler: Rental) => alquiler.renter?.id === userId);

        if (status !== 'all') {
          filteredAlquileres = filteredAlquileres.filter((alquiler: Rental) => {
            const currentDate = new Date();
            const rentalStartDate = alquiler.startDate ? new Date(alquiler.startDate) : null;
            const rentalEndDate = alquiler.endDate ? new Date(alquiler.endDate) : null;

            if (!rentalStartDate || !rentalEndDate) return false;

            switch (status) {
              case 'upcoming':
                return (alquiler.status === 'PENDING_OWNER_APPROVAL' || alquiler.status === 'CONFIRMED') && rentalStartDate > currentDate;
              case 'completed':
                return alquiler.status === 'COMPLETED' || rentalEndDate < currentDate;
              case 'pending':
                return alquiler.status === 'PENDING_OWNER_APPROVAL';
              default:
                return true;
            }
          });
        }
        return filteredAlquileres;
      }),
      catchError((err: HttpErrorResponse) => {
        console.error(`Error al obtener alquileres para el usuario ${userId} con estado ${status}:`, err);
        return of([]);
      })
    );
  }
}
