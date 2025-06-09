import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

import { RentalService} from '../../services/rental.service';
import { Rental} from '../../model/rental.entity';

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
}
