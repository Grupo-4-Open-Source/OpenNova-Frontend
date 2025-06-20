import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RentalService } from '../../../../rental/services/rental.service';
import { Rental } from '../../../../rental/model/rental.entity';
import { VehicleCardComponent } from '../../../../vehicle/components/vehicle-card/vehicle-card.component';

@Component({
  selector: 'app-booking-requests-section',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, VehicleCardComponent, MatProgressSpinnerModule],
  templateUrl: './booking-requests-section.component.html',
  styleUrls: ['./booking-requests-section.component.css']
})
export class BookingRequestsSectionComponent implements OnInit {
  bookingRequests: Rental[] = [];
  isLoading = true;
  error: string | null = null;
  private testOwnerId = 'user002';

  constructor(private rentalService: RentalService) {}

  ngOnInit(): void {
    this.loadBookingRequests();
  }

  loadBookingRequests(): void {
    this.isLoading = true;
    this.error = null;
    this.rentalService.getRentalsForOwner(this.testOwnerId, 'pending').subscribe({
      next: data => {
        this.bookingRequests = data.slice(0, 4);
        this.isLoading = false;
      },
      error: err => {
        this.error = 'No se pudieron cargar las solicitudes de alquiler.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  approveRental(rentalId: string): void {
    this.rentalService.update(rentalId, { status: 'CONFIRMED' }).subscribe(() => {
      console.log(`Rental ${rentalId} approved.`);
      this.loadBookingRequests();
    });
  }

  rejectRental(rentalId: string): void {
    this.rentalService.update(rentalId, { status: 'REJECTED' }).subscribe(() => {
      console.log(`Rental ${rentalId} rejected.`);
      this.loadBookingRequests();
    });
  }
}
