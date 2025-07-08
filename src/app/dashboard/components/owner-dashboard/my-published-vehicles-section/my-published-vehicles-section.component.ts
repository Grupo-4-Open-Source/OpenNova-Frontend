import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PublicationService } from '../../../../publications/services/publication.service';
import { Publication } from '../../../../publications/model/publication.entity';
import { VehicleCardComponent } from '../../../../vehicle/components/vehicle-card/vehicle-card.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Import MatSnackBar

@Component({
  selector: 'app-my-published-vehicles-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    VehicleCardComponent,
    MatProgressSpinnerModule,
    MatSnackBarModule // Add MatSnackBarModule to imports
  ],
  templateUrl: './my-published-vehicles-section.component.html',
  styleUrls: ['./my-published-vehicles-section.component.css']
})
export class MyPublishedVehiclesSectionComponent implements OnInit {
  myPublications: Publication[] = [];
  isLoading = true;
  error: string | null = null;
  private testOwnerId = '1'; // Usar un ID de propietario de prueba

  constructor(
    private publicationService: PublicationService,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMyPublications();
  }

  loadMyPublications(): void {
    this.isLoading = true;
    this.error = null;
    this.publicationService.getPublicationsByOwnerId(this.testOwnerId).subscribe({
      next: data => {
        this.myPublications = data.slice(0, 4);
        this.isLoading = false;
        if (this.myPublications.length === 0) {
          this.error = 'No tienes publicaciones activas en este momento.';
        }
      },
      error: err => {
        this.error = 'No se pudieron cargar tus publicaciones.';
        console.error('Error al cargar publicaciones:', err);
        this.isLoading = false;
        this.snackBar.open('Error al cargar tus publicaciones.', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
