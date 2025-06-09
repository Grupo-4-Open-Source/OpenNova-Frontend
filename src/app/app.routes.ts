import { Routes } from '@angular/router';
import { AboutComponent } from "./public/pages/about/about.component";
import { PageNotFoundComponent } from "./public/pages/page-not-found/page-not-found.component";
import { RenterDashboardComponent} from './dashboard/pages/renter-dashboard/renter-dashboard.component';
import { PublishVehicleComponent} from './publications/pages/publish-vehicle/publish-vehicle.component';
import { RentVehicleComponent} from './rental/pages/rent-vehicle.component';
import { BookingDetailPageComponent} from './rental/pages/booking-detail/booking-detail.component';

export const routes: Routes = [
  { path: 'dashboard', component: RenterDashboardComponent },
  { path: 'about', component: AboutComponent },
  { path: 'publish-vehicle', component: PublishVehicleComponent },
  { path: 'rent-vehicle/:publicacionId', component: RentVehicleComponent },
  { path: 'my-bookings/details/:id', component: BookingDetailPageComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
