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
  selector: 'app-available-vehicles-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    VehicleCardComponent,
    MatButtonModule,
    MatProgressSpinnerModule, 
    MatSnackBarModule 
  ],
  templateUrl: './available-vehicles-section.component.html',
  styleUrls: ['./available-vehicles-section.component.css']
})
export class AvailableVehiclesSectionComponent implements OnInit {
  allAvailableVehicles: Publication[] = [];
  availableVehicles: Publication[] = [];
  isLoading = true;
  error: string | null = null;
  displayLimit: number = 4;

  constructor(
    private publicacionService: PublicationService,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) { }

  ngOnInit(): void {
   this.getAvailableVehicles();
  }

  private getAvailableVehicles(): void {
    this.isLoading = true;
    this.error = null;

    this.publicacionService.getAvailablePublications().pipe(
      catchError(err => {
        this.error = 'No se pudieron cargar los vehículos disponibles.';
        this.isLoading = false;
        console.error('Error al cargar vehículos disponibles:', err);
        this.snackBar.open('Error al cargar vehículos disponibles.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
        return of([]);
      })
    ).subscribe(data => {
      this.allAvailableVehicles = data;
      this.availableVehicles = [...this.allAvailableVehicles]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || '').getTime(); // Usar createdAt como fallback
          const dateB = new Date(b.createdAt || '').getTime(); // Usar createdAt como fallback
          return dateB - dateA;
        })
        .slice(0, this.displayLimit);
      this.isLoading = false;
      if (this.availableVehicles.length === 0) {
        this.error = 'No hay vehículos disponibles en este momento.';
      }
    });
  }
}
