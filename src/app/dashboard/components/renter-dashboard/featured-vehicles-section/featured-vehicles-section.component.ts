import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; 
import { PublicationService} from '../../../../publications/services/publication.service';
import { Publication} from '../../../../publications/model/publication.entity';
import { VehicleCardComponent} from '../../../../vehicle/components/vehicle-card/vehicle-card.component';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-featured-vehicles-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    VehicleCardComponent,
    MatProgressSpinnerModule, 
    MatSnackBarModule 
  ],
  templateUrl: './featured-vehicles-section.component.html',
  styleUrls: ['./featured-vehicles-section.component.css']
})
export class FeaturedVehiclesSectionComponent implements OnInit {
  allFeaturedVehicles: Publication[] = [];
  featuredVehicles: Publication[] = [];
  isLoading = true;
  error: string | null = null;
  displayLimit: number = 10;

  constructor(
    private publicacionService: PublicationService,
    private snackBar: MatSnackBar 
  ) { }

  ngOnInit(): void {
    this.getFeaturedVehicles();
  }

  private getFeaturedVehicles(): void {
    this.isLoading = true;
    this.error = null;

    this.publicacionService.getFeaturedPublications().pipe(
      catchError(err => {
        this.error = 'No se pudieron cargar los vehículos destacados.';
        this.isLoading = false;
        console.error('Error al cargar vehículos destacados:', err);
        this.snackBar.open('Error al cargar vehículos destacados.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        return of([]);
      })
    ).subscribe(data => {
      this.allFeaturedVehicles = data;
      this.featuredVehicles = [...this.allFeaturedVehicles]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || '').getTime(); // Usar createdAt como fallback
          const dateB = new Date(b.createdAt || '').getTime(); // Usar createdAt como fallback
          return dateB - dateA; 
        })
        .slice(0, this.displayLimit);
      this.isLoading = false;
      if (this.featuredVehicles.length === 0) {
        this.error = 'No hay vehículos destacados en este momento.';
      }
    });
  }
}
