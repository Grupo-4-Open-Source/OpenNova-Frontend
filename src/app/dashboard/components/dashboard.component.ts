import { Component } from '@angular/core';
import { FeaturedVehiclesSectionComponent } from './renter-dashboard/featured-vehicles-section/featured-vehicles-section.component';
import { MyPostCardsComponent } from './my-post-cards/my-post-cards.component';
import { BookedVehiclesSectionComponent } from './renter-dashboard/booked-vehicles-section/booked-vehicles-section.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [FeaturedVehiclesSectionComponent, MyPostCardsComponent, BookedVehiclesSectionComponent]
})
export class DashboardComponent {
}
