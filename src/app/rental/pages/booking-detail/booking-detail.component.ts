import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { of, forkJoin, Observable } from 'rxjs';
import { catchError, switchMap, take, filter, map } from 'rxjs/operators';

import { RentalService } from '../../services/rental.service';
import { Rental } from '../../model/rental.entity'; 
import { PublicationService } from '../../../publications/services/publication.service';
import { VehicleService } from '../../../vehicle/services/vehicle.service';
import { LocationService } from '../../../publications/services/location.service';
import { InsuranceService } from '../../services/insurance.service';
import { UserService } from '../../../iam/services/user.service';

import { Publication } from '../../../publications/model/publication.entity';
import { Vehicle } from '../../../vehicle/model/vehicle.entity'; 
import { Location } from '../../../publications/model/location.entity';
import { Insurance } from '../../model/insurance.entity';
import { User } from '../../../iam/model/user.entity';

import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-booking-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    NgClass
  ],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.css']
})
export class BookingDetailPageComponent implements OnInit {
  alquiler: Rental | undefined;
  currentPublication: Publication | undefined;
  currentVehicle: Vehicle | undefined;
  currentPickupLocation: Location | undefined;
  currentDropoffLocation: Location | undefined;
  currentInsurance: Insurance | undefined;
  currentOwner: User | undefined;

  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alquilerService: RentalService,
    private publicationService: PublicationService,
    private vehicleService: VehicleService,
    private locationService: LocationService,
    private insuranceService: InsuranceService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const idParam = params.get('id');
        const id = idParam ? parseInt(idParam, 10) : NaN;
        if (isNaN(id)) {
          this.error = 'ID de reserva no válido.';
          this.isLoading = false;
          return of(undefined);
        }

        this.isLoading = true;
        this.error = null;
        return this.alquilerService.getRentalById(id).pipe(
          catchError(err => {
            console.error('Error al cargar la reserva:', err);
            this.error = 'Error al cargar los detalles de la reserva. Inténtalo de nuevo.';
            return of(undefined);
          })
        );
      }),
      filter((alquiler): alquiler is Rental => !!alquiler),
      switchMap(alquiler => {
        this.alquiler = alquiler;

        const publicationObs: Observable<Publication | undefined> = this.publicationService.getPublicationByExternalId(alquiler.publicationId as unknown as string).pipe( // CORRECCIÓN TS2352
          catchError(err => { console.error('Error fetching publication:', err); return of(undefined); })
        );
        const pickupLocationObs: Observable<Location | undefined> = this.locationService.getLocationById(alquiler.pickupLocationId).pipe( 
          catchError(err => { console.error('Error fetching pickup location:', err); return of(undefined); })
        );
        const dropoffLocationObs: Observable<Location | undefined> = alquiler.dropoffLocationId ? this.locationService.getLocationById(alquiler.dropoffLocationId).pipe(
          catchError(err => { console.error('Error fetching dropoff location:', err); return of(undefined); })
        ) : of(undefined);
        const insuranceObs: Observable<Insurance | undefined> = alquiler.insuranceId ? this.insuranceService.getInsuranceById(alquiler.insuranceId).pipe(
          catchError(err => { console.error('Error fetching insurance:', err); return of(undefined); })
        ) : of(undefined);

        return forkJoin({
          publication: publicationObs,
          pickupLocation: pickupLocationObs,
          dropoffLocation: dropoffLocationObs,
          insurance: insuranceObs
        }).pipe(
          switchMap(initialData => {
            const vehicleObs: Observable<Vehicle | undefined> = initialData.publication?.vehicleId ? this.vehicleService.getVehicleById(initialData.publication.vehicleId).pipe(
              catchError(err => { console.error('Error fetching vehicle:', err); return of(undefined); })
            ) : of(undefined);
            const ownerObs: Observable<User | undefined> = initialData.publication?.ownerId ? this.userService.getUserById(initialData.publication.ownerId).pipe(
              catchError(err => { console.error('Error fetching owner:', err); return of(undefined); })
            ) : of(undefined);

            return forkJoin({
              publication: of(initialData.publication),
              pickupLocation: of(initialData.pickupLocation),
              dropoffLocation: of(initialData.dropoffLocation),
              insurance: of(initialData.insurance),
              vehicle: vehicleObs,
              owner: ownerObs
            });
          })
        );
      }),
      take(1),
      catchError(err => {
        console.error('Error en la carga integral de datos para los detalles de la reserva:', err);
        this.error = 'No se pudieron cargar todos los detalles de la reserva. Inténtalo de nuevo.';
        this.isLoading = false;
        this.snackBar.open(this.error, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
        return of(undefined);
      })
    ).subscribe({
      next: (finalData) => {
        if (finalData) {
          this.currentPublication = finalData.publication;
          this.currentVehicle = finalData.vehicle;
          this.currentPickupLocation = finalData.pickupLocation;
          this.currentDropoffLocation = finalData.dropoffLocation;
          this.currentInsurance = finalData.insurance;
          this.currentOwner = finalData.owner;
        } else if (!this.error) {
          this.error = 'Reserva no encontrada o incompleta.';
        }
        this.isLoading = false;
      },
      error: () => {
        
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/my-bookings']);
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    return `status-${status.toLowerCase().replace(/_/g, '-')}`;
  }

  cancelBooking(): void {
    if (!this.alquiler || !this.alquiler.id) {
      this.snackBar.open('No se puede cancelar una reserva no válida.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar Cancelación',
        message: `¿Estás seguro de que quieres cancelar la reserva del vehículo ${this.currentVehicle?.make || ''} ${this.currentVehicle?.model || ''}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        const updatedStatus = 'CANCELLED';
        this.alquilerService.updateRental(this.alquiler!.id, { status: updatedStatus }).subscribe({
          next: (updatedAlquiler) => {
            this.alquiler = updatedAlquiler;
            this.snackBar.open('Reserva cancelada exitosamente.', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
            this.isLoading = false;
            this.router.navigate(['/my-bookings']);
          },
          error: (err) => {
            console.error('Error al cancelar la reserva:', err);
            this.snackBar.open('Error al cancelar la reserva. Inténtalo de nuevo.', 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
            this.isLoading = false;
          }
        });
      }
    });
  }
}
