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
import {MyBookingsPageComponent} from './rental/pages/my-bookings-page/my-bookings-page.component';
import {SignInComponent} from "./iam/pages/sign-in/sign-in.component";
import {SignUpComponent} from "./iam/pages/sign-up/sign-up.component";
import {authenticationGuard} from "./iam/services/authentication.guard";
import { RegisterVehicleComponent} from './vehicle/components/register-vehicle.component';

@Component({
  selector: 'app-my-bookings-placeholder',
  template: '<h2>My Bookings - Coming Soon!</h2><p>This section is under construction.</p>',
  standalone: true
})
export class MyBookingsPlaceholderComponent {}


export const routes: Routes = [
  { path: 'select-role', component: RoleSelectionComponent },
  { path: 'dashboard', component: RenterDashboardComponent , canActivate: [authenticationGuard]},
  { path: 'owner-dashboard', component: OwnerDashboardComponent , canActivate: [authenticationGuard]},
  { path: 'publish-vehicle', component: PublishVehicleComponent , canActivate: [authenticationGuard]},
  {path: 'my-bookings', component: MyBookingsPageComponent, canActivate: [authenticationGuard]},
  { path: 'my-bookings/details/:id', component: BookingDetailPageComponent , canActivate: [authenticationGuard] },
  { path: 'rent-vehicle/:publicacionId', component: RentVehicleComponent , canActivate: [authenticationGuard] },
  { path: 'register-vehicle', component: RegisterVehicleComponent,canActivate: [authenticationGuard]  },
  { path: 'about', component: AboutComponent },
  { path: 'my-bookings', component: MyBookingsPlaceholderComponent, canActivate: [authenticationGuard] },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent},
  { path: '', redirectTo: 'select-role', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
