import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FeaturedVehiclesSectionComponent} from '../../components/renter-dashboard/featured-vehicles-section/featured-vehicles-section.component';
import { BookedVehiclesSectionComponent} from '../../components/renter-dashboard/booked-vehicles-section/booked-vehicles-section.component';
import { AvailableVehiclesSectionComponent} from '../../components/renter-dashboard/available-vehicles-section/available-vehicles-section.component';

@Component({
  selector: 'app-renter-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FeaturedVehiclesSectionComponent,
    BookedVehiclesSectionComponent,
    AvailableVehiclesSectionComponent
  ],
  templateUrl: './renter-dashboard.component.html',
  styleUrls: ['./renter-dashboard.component.css']
})
export class RenterDashboardComponent {}
