// src/app/rental/pages/my-bookings-page/my-bookings-page.component.ts
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RentalService } from '../../services/rental.service';
import { Rental } from '../../model/rental.entity'; 
import { PublicationService } from '../../../publications/services/publication.service';
import { Publication } from '../../../publications/model/publication.entity';
import { VehicleService } from '../../../vehicle/services/vehicle.service';
import { Vehicle} from '../../../vehicle/model/vehicle.entity'; 

import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

interface RentalWithDetails extends Rental {
  publication?: Publication;
  vehicle?: Vehicle;
}

@Component({
  selector: 'app-my-bookings-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    NgClass,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './my-bookings-page.component.html',
  styleUrls: ['./my-bookings-page.component.css']
})
export class MyBookingsPageComponent implements OnInit, AfterViewInit {
  dataSource!: MatTableDataSource<RentalWithDetails>;
  displayedColumns: string[] = ['vehicleInfo', 'dates', 'totalCost', 'status', 'actions'];
  isLoading: boolean = true;
  error: string | null = null;

  // Mapa para almacenar las publicaciones, indexadas por su externalId
  publicationsMap: { [externalId: string]: Publication } = {};
  vehiclesMap: { [id: number]: Vehicle } = {};

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  private testRenterId: string = 'user001';

  constructor(
    private alquilerService: RentalService,
    private publicationService: PublicationService,
    private vehicleService: VehicleService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataSource = new MatTableDataSource<RentalWithDetails>();
  }

  ngOnInit(): void {
    this.loadMyBookings();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item: RentalWithDetails, property: string) => {
      const publication = item.publication;
      const vehicle = item.vehicle;

      switch (property) {
        case 'vehicleInfo': return vehicle?.make || '';
        case 'dates': return new Date(item.startDate).getTime();
        default: return (item as any)[property];
      }
    };

    this.dataSource.filterPredicate = (data: RentalWithDetails, filter: string): boolean => {
      const vehicleMake = data.vehicle?.make || '';
      const vehicleModel = data.vehicle?.model || '';
      const licensePlate = data.vehicle?.licensePlate || '';
      const startDate = data.startDate || '';
      const endDate = data.endDate || '';
      const totalCost = data.totalCost?.toString() || '';
      const status = data.status || '';

      const dataToFilter = `${vehicleMake} ${vehicleModel} ${licensePlate} ${startDate} ${endDate} ${totalCost} ${status}`;
      return dataToFilter.toLowerCase().includes(filter.toLowerCase());
    }
  }

  loadMyBookings(): void {
    this.isLoading = true;
    this.error = null;
    this.publicationsMap = {};
    this.vehiclesMap = {};

    this.alquilerService.getMyRentals(this.testRenterId, 'all').pipe(
      switchMap((rentals: Rental[]) => {
        if (rentals.length === 0) {
          return of([]);
        }

        const requests: Observable<RentalWithDetails>[] = rentals.map(rental =>
          this.publicationService.getPublicationByExternalId(rental.publicationId as unknown as string).pipe(
            switchMap(publication => {
              if (!publication) {
                return of({ ...rental, publication: undefined, vehicle: undefined });
              }
              this.publicationsMap[publication.externalId] = publication;

              return this.vehicleService.getVehicleById(publication.vehicleId).pipe(
                map(vehicle => {
                  if (vehicle) {
                    this.vehiclesMap[vehicle.id] = vehicle;
                  }
                  return { ...rental, publication, vehicle };
                }),
                catchError(err => {
                  console.error(`Error loading vehicle ${publication.vehicleId}:`, err);
                  return of({ ...rental, publication, vehicle: undefined });
                })
              );
            }),
            catchError(err => {
              console.error(`Error loading publication ${rental.publicationId}:`, err);
              return of({ ...rental, publication: undefined, vehicle: undefined });
            })
          )
        );
        return forkJoin(requests);
      }),
      catchError(err => {
        console.error('Error al cargar mis reservas o detalles adicionales:', err);
        this.error = 'No se pudieron cargar tus reservas o algunos detalles. Inténtalo de nuevo más tarde.';
        this.isLoading = false;
        this.snackBar.open(this.error, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
        return of([]);
      })
    ).subscribe((rentalsWithDetails: RentalWithDetails[]) => {
      this.dataSource.data = rentalsWithDetails.sort((a, b) =>
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );
      this.isLoading = false;
    });
  }

  viewBookingDetails(alquilerId: number): void {
    this.router.navigate(['/my-bookings/details', alquilerId]);
  }

  cancelBooking(alquiler: Rental): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirmar Cancelación',
        message: '¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        const updatedStatus = 'CANCELLED';
        this.alquilerService.updateRental(alquiler.id, { status: updatedStatus }).subscribe({
          next: () => {
            this.snackBar.open('Reserva cancelada exitosamente.', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
            this.loadMyBookings();
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    switch (status) {
      case 'CONFIRMED': return 'status-confirmed';
      case 'PENDING_OWNER_APPROVAL': return 'status-pending';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }
}
