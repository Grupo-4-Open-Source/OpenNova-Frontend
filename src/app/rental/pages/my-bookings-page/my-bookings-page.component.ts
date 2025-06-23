import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { RentalService} from '../../services/rental.service';
import { Rental} from '../../model/rental.entity';


import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

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
    NgClass
  ],
  templateUrl: './my-bookings-page.component.html',
  styleUrls: ['./my-bookings-page.component.css']
})
export class MyBookingsPageComponent implements OnInit, AfterViewInit {
  dataSource!: MatTableDataSource<Rental>;
  displayedColumns: string[] = ['vehicleInfo', 'dates', 'totalCost', 'status', 'actions'];
  isLoading: boolean = true;
  error: string | null = null;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  private testRenterId: string = 'user001';

  constructor(
    private alquilerService: RentalService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataSource = new MatTableDataSource<Rental>();
  }

  ngOnInit(): void {
    this.loadMyBookings();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item: Rental, property: string) => {
      switch (property) {
        case 'vehicleInfo': return item.publication?.vehicle?.make;
        case 'dates': return new Date(item.startDate).getTime();
        default: return (item as any)[property];
      }
    };

    this.dataSource.filterPredicate = (data: Rental, filter: string): boolean => {
      const dataStr = JSON.stringify(data).toLowerCase();
      return dataStr.indexOf(filter) !== -1;
    }
  }

  loadMyBookings(): void {
    this.isLoading = true;
    this.error = null;
    this.alquilerService.getMyRentals(this.testRenterId, 'all').subscribe({
      next: (alquileres: Rental[]) => {
        this.dataSource.data = alquileres.sort((a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar mis reservas:', err);
        this.error = 'No se pudieron cargar tus reservas. Inténtalo de nuevo más tarde.';
        this.isLoading = false;
        this.dataSource.data = [];
      }
    });
  }

  viewBookingDetails(alquilerId: string): void {
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
            this.snackBar.open('Reserva cancelada exitosamente.', 'Cerrar', { duration: 3000 });
            this.loadMyBookings();
          },
          error: (err) => {
            console.error('Error al cancelar la reserva:', err);
            this.snackBar.open('Error al cancelar la reserva. Inténtalo de nuevo.', 'Cerrar', { duration: 5000 });
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
      case 'RECHAZADO': return 'status-rejected';
      default: return '';
    }
  }
}
