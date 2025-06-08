import { Routes } from '@angular/router';
import { AboutComponent } from "./public/pages/about/about.component";
import { PageNotFoundComponent } from "./public/pages/page-not-found/page-not-found.component";
import {NavigationViewComponent} from './navigation/pages/navigation-view/navigation-interface.component';
import {VehicleManagementComponent} from './publications/pages/vehicle-management/vehicle-management.component';
import { RenterDashboardComponent} from './dashboard/pages/renter-dashboard/renter-dashboard.component';
import { PublishVehicleComponent} from './publications/pages/publish-vehicle/publish-vehicle.component';
import { RentVehicleComponent} from './rental/pages/rent-vehicle.component';

export const routes: Routes = [
  { path: 'dashboard', component: RenterDashboardComponent },
  { path: 'about', component: AboutComponent },
  { path: 'navigation', component: NavigationViewComponent },
  {path: 'publications', component: VehicleManagementComponent},
  { path: 'publish-vehicle', component: PublishVehicleComponent },
  { path: 'rent-vehicle/:publicacionId', component: RentVehicleComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
