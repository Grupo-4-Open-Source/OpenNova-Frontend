import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { RentalService } from '../../../../rental/services/rental.service';
import { Rental } from '../../../../rental/model/rental.entity'; 
import { VehicleCardComponent } from '../../../../vehicle/components/vehicle-card/vehicle-card.component';
import { PublicationService } from '../../../../publications/services/publication.service';
import { Publication } from '../../../../publications/model/publication.entity';

@Component({
  selector: 'app-booking-requests-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    VehicleCardComponent,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  providers: [DatePipe],
  templateUrl: './booking-requests-section.component.html',
  styleUrls: ['./booking-requests-section.component.css']
})
export class BookingRequestsSectionComponent implements OnInit {
  bookingRequests: Rental[] = [];
  bookingRequestPublications: { [publicationExternalId: string]: Publication } = {};
  isLoading = true;
  error: string | null = null;
  private testOwnerId = 'user002';

  constructor(
    private rentalService: RentalService,
    private publicationService: PublicationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBookingRequests();
  }

  loadBookingRequests(): void {
    this.isLoading = true;
    this.error = null;
    this.bookingRequestPublications = {};

    this.rentalService.getRentalsForOwner(this.testOwnerId, 'pending').subscribe({
      next: rentals => {
        this.bookingRequests = rentals.slice(0, 4);

        if (this.bookingRequests.length === 0) {
          this.error = 'No tienes nuevas solicitudes de alquiler en este momento.';
          this.isLoading = false;
          return;
        }

        const publicationRequests: Observable<Publication | undefined>[] = this.bookingRequests.map(rental =>
               this.publicationService.getPublicationByExternalId(rental.publicationId as unknown as string).pipe(
            catchError(err => {
              console.error(`Error al cargar la publicación ${rental.publicationId} para el alquiler ${rental.id}:`, err);
              return of(undefined);
            })
          )
        );

        forkJoin(publicationRequests).subscribe({
          next: publications => {
            publications.forEach((pub) => { // Eliminado 'index' si no se usa
              if (pub) {
                this.bookingRequestPublications[pub.externalId] = pub;
              }
            });
            this.isLoading = false;
          },
          error: err => {
            this.error = 'No se pudieron cargar los detalles de los vehículos para las solicitudes.';
            console.error('Error al cargar publicaciones relacionadas:', err);
            this.isLoading = false;
            this.snackBar.open('Error al cargar detalles de vehículos.', 'Cerrar', { duration: 3000 });
          }
        });
      },
      error: err => {
        this.error = 'No se pudieron cargar las solicitudes de alquiler.';
        console.error('Error al cargar solicitudes de alquiler:', err);
        this.isLoading = false;
        this.snackBar.open('Error al cargar solicitudes de alquiler.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getPublicationForRental(rental: Rental): Publication | undefined {
    return this.bookingRequestPublications[rental.publicationId as unknown as string];
  }

  approveRental(rentalId: number): void {
    this.rentalService.updateRental(rentalId, { status: 'CONFIRMED' }).subscribe({
      next: () => {
        this.snackBar.open(`Solicitud ${rentalId} aprobada.`, 'Cerrar', { duration: 3000 });
        this.loadBookingRequests();
      },
      error: err => {
        console.error(`Error al aprobar el alquiler ${rentalId}:`, err);
        this.snackBar.open(`Error al aprobar la solicitud ${rentalId}.`, 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  rejectRental(rentalId: number): void {
    this.rentalService.updateRental(rentalId, { status: 'REJECTED' }).subscribe({
      next: () => {
        this.snackBar.open(`Solicitud ${rentalId} rechazada.`, 'Cerrar', { duration: 3000 });
        this.loadBookingRequests();
      },
      error: err => {
        console.error(`Error al rechazar el alquiler ${rentalId}:`, err);
        this.snackBar.open(`Error al rechazar la solicitud ${rentalId}.`, 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }
}
