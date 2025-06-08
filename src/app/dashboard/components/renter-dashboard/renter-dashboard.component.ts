import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FeaturedVehiclesSectionComponent} from './featured-vehicles-section/featured-vehicles-section.component';
import { BookedVehiclesSectionComponent} from './booked-vehicles-section/booked-vehicles-section.component';
import { AvailableVehiclesSectionComponent} from './available-vehicles-section/available-vehicles-section.component';

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
