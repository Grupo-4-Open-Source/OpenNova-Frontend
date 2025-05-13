import { Routes } from '@angular/router';
import { HomeComponent } from "./public/pages/home/home.component";
import { AboutComponent } from "./public/pages/about/about.component";
import { PageNotFoundComponent } from "./public/pages/page-not-found/page-not-found.component";
import {NavigationViewComponent} from './navigation/pages/navigation-view/navigation-interface.component';
import {DashboardComponent} from './dashboard/components/dashboard.component';
import { VehicleManagementComponent } from './publications/pages/vehicle-management/vehicle-management.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'navigation', component: NavigationViewComponent }, // Nueva ruta añadida
  { path: 'dashboard', component: DashboardComponent }, // Nueva ruta añadida
  { path: 'publications/vehicles', component: VehicleManagementComponent }, // Nueva ruta añadida
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
