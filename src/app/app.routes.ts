import { Routes } from '@angular/router';
import { HomeComponent } from "./public/pages/home/home.component";
import { AboutComponent } from "./public/pages/about/about.component";
import { PageNotFoundComponent } from "./public/pages/page-not-found/page-not-found.component";
import {NavigationViewComponent} from './navigation/pages/navigation-view/navigation-interface.component';
import {DashboardComponent} from './dashboard/components/dashboard.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'navigation', component: NavigationViewComponent }, // Nueva ruta añadida
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
