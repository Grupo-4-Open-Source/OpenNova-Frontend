import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RentalService} from '../../../../rental/services/rental.service';
import { Rental} from '../../../../rental/model/rental.entity'; 
import { PublicationService } from '../../../../publications/services/publication.service';
import { Publication } from '../../../../publications/model/publication.entity';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { VehicleCardComponent} from '../../../../vehicle/components/vehicle-card/vehicle-card.component';

@Component({
  selector: 'app-booked-vehicles-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    VehicleCardComponent,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './booked-vehicles-section.component.html',
  styleUrls: ['./booked-vehicles-section.component.css']
})
export class BookedVehiclesSectionComponent implements OnInit, OnDestroy {
  allBookedRentals: Rental[] = [];
  bookedRentalsToDisplay: Rental[] = [];
  bookedRentalPublications: { [publicationExternalId: string]: Publication } = {};
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  displayLimit: number = 4;

  private testRenterId: string = 'user001';

  constructor(
    private rentalService: RentalService,
    private publicationService: PublicationService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadBookedVehicles(this.testRenterId);
  }

  loadBookedVehicles(userId: string): void {
    this.isLoading = true;
    this.error = null;
    this.bookedRentalPublications = {};

    this.rentalService.getMyRentals(userId, 'upcoming')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rentals: Rental[]) => {
          this.allBookedRentals = rentals;
          this.bookedRentalsToDisplay = [...this.allBookedRentals]
            .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
            .slice(0, this.displayLimit);

          if (this.bookedRentalsToDisplay.length === 0) {
            this.error = 'No tienes reservas próximas en este momento.';
            this.isLoading = false;
            return;
          }

          const publicationRequests = this.bookedRentalsToDisplay.map(rental =>
            // CORRECCIÓN TS2352: Casteo a 'unknown' primero, luego a 'string'.
            this.publicationService.getPublicationByExternalId(rental.publicationId as unknown as string).pipe(
              catchError(err => {
                console.error(`Error loading publication ${rental.publicationId} for rental ${rental.id}:`, err);
                return of(undefined);
              })
            )
          );

          forkJoin(publicationRequests).subscribe({
            next: (publications) => {
              publications.forEach((pub) => { 
                if (pub) {
                  this.bookedRentalPublications[pub.externalId] = pub;
                }
              });
              this.isLoading = false;
            },
            error: (err) => {
              this.error = 'No se pudieron cargar los detalles de los vehículos para tus reservas.';
              console.error('Error al cargar publicaciones relacionadas para reservas:', err);
              this.isLoading = false;
              this.snackBar.open('Error al cargar detalles de vehículos para reservas.', 'Cerrar', { duration: 3000 });
            }
          });
        },
        error: (err: any) => {
          this.error = 'No se pudieron cargar tus reservas.';
          this.isLoading = false;
          console.error('Error al cargar reservas:', err);
          this.snackBar.open('Error al cargar tus reservas.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        }
      });
  }

  getPublicationForRental(rental: Rental): Publication | undefined {
    return this.bookedRentalPublications[rental.publicationId as unknown as string];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
