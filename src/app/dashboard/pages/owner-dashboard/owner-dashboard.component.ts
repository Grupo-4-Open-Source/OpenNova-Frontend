import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingRequestsSectionComponent} from '../../components/owner-dashboard/booking-request-section/booking-requests-section.component';
import { MyPublishedVehiclesSectionComponent} from '../../components/owner-dashboard/my-published-vehicles-section/my-published-vehicles-section.component';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, BookingRequestsSectionComponent, MyPublishedVehiclesSectionComponent],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.css']
})
export class OwnerDashboardComponent {}
