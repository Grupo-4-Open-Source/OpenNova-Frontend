import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { RentalService} from '../../../../rental/services/rental.service';
import { Rental} from '../../../../rental/model/rental.entity';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VehicleCardComponent} from '../../../../vehicle/components/vehicle-card/vehicle-card.component';
import { User} from '../../../../iam/model/user.entity';

@Component({
  selector: 'app-booked-vehicles-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    VehicleCardComponent
  ],
  templateUrl: './booked-vehicles-section.component.html',
  styleUrls: ['./booked-vehicles-section.component.css']
})
export class BookedVehiclesSectionComponent implements OnInit, OnDestroy {
  allBookedVehicles: Rental[] = [];
  bookedVehicles: Rental[] = [];
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  displayLimit: number = 4;

  private testRenterId: string = 'user001';

  constructor(
    private alquilerService: RentalService,
  ) { }

  ngOnInit(): void {
    this.loadBookedVehicles(this.testRenterId);
  }

  loadBookedVehicles(userId: string): void {
    this.isLoading = true;
    this.error = null;

    this.alquilerService.getMyRentals(userId, 'upcoming')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Rental[]) => {
          this.allBookedVehicles = data;
          this.bookedVehicles = [...this.allBookedVehicles]
            .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
            .slice(0, this.displayLimit);
          this.isLoading = false;
        },
        error: (err: any) => {
          this.error = 'No se pudieron cargar tus reservas.';
          this.isLoading = false;
          console.error('Error al cargar reservas:', err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
