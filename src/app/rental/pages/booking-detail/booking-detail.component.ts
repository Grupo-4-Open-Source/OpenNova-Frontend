import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

import { RentalService} from '../../services/rental.service';
import { Rental} from '../../model/rental.entity';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-booking-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.css']
})
export class BookingDetailPageComponent implements OnInit {
  alquiler: Rental | undefined;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alquilerService: RentalService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isLoading = true;
          this.error = null;
          return this.alquilerService.getRentalById(id);
        } else {
          this.error = 'No se proporcionó ID de reserva.';
          this.isLoading = false;
          return of(undefined);
        }
      }),
      take(1),
      catchError(err => {
        console.error('Error al cargar detalles de la reserva:', err);
        this.error = 'Error al cargar los detalles de la reserva. Inténtalo de nuevo.';
        this.isLoading = false;
        return of(undefined);
      })
    ).subscribe(alquiler => {
      this.alquiler = alquiler;
      this.isLoading = false;
      if (!alquiler && !this.error) {
        this.error = 'Reserva no encontrada.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/my-bookings']);
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


  cancelBooking(): void {
    if (!this.alquiler || !this.alquiler.id) {
      this.snackBar.open('No se puede cancelar una reserva no válida.', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar Cancelación',
        message: `¿Estás seguro de que quieres cancelar la reserva del vehículo ${this.alquiler.publication?.vehicle?.make} ${this.alquiler.publication?.vehicle?.model}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        const updatedStatus = 'CANCELLED';
        this.alquilerService.updateRental(this.alquiler!.id, { status: updatedStatus }).subscribe({
          next: (updatedAlquiler) => {
            this.alquiler = updatedAlquiler;
            this.snackBar.open('Reserva cancelada exitosamente.', 'Cerrar', { duration: 3000 });
            this.isLoading = false;
            this.router.navigate(['/my-bookings']);
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
}
