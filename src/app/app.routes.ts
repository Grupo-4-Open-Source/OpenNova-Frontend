import { Routes } from '@angular/router';
import { AboutComponent } from "./public/pages/about/about.component";
import { PageNotFoundComponent } from "./public/pages/page-not-found/page-not-found.component";
import { RenterDashboardComponent } from './dashboard/pages/renter-dashboard/renter-dashboard.component';
import { OwnerDashboardComponent} from './dashboard/pages/owner-dashboard/owner-dashboard.component';
import { PublishVehicleComponent } from './publications/pages/publish-vehicle/publish-vehicle.component';
import { RentVehicleComponent } from './rental/pages/rent-vehicle.component';
import { RoleSelectionComponent } from './public/pages/role-selection/role-selection.component';
import { Component } from '@angular/core';
import {BookingDetailPageComponent} from './rental/pages/booking-detail/booking-detail.component';

@Component({
  selector: 'app-my-bookings-placeholder',
  template: '<h2>My Bookings - Coming Soon!</h2><p>This section is under construction.</p>',
  standalone: true
})
export class MyBookingsPlaceholderComponent {}


export const routes: Routes = [
  { path: 'select-role', component: RoleSelectionComponent },
  { path: 'dashboard', component: RenterDashboardComponent },
  { path: 'owner-dashboard', component: OwnerDashboardComponent },
  { path: 'publish-vehicle', component: PublishVehicleComponent },
  { path: 'my-bookings/details/:id', component: BookingDetailPageComponent },
  { path: 'rent-vehicle/:publicacionId', component: RentVehicleComponent },
  { path: 'about', component: AboutComponent },
  { path: 'my-bookings', component: MyBookingsPlaceholderComponent },
  { path: '', redirectTo: 'select-role', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
