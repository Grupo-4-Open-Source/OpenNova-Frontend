import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PublicationService } from '../../../../publications/services/publication.service';
import { Publication } from '../../../../publications/model/publication.entity';
import { VehicleCardComponent } from '../../../../vehicle/components/vehicle-card/vehicle-card.component';

@Component({
  selector: 'app-my-published-vehicles-section',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, VehicleCardComponent, MatProgressSpinnerModule],
  templateUrl: './my-published-vehicles-section.component.html',
  styleUrls: ['./my-published-vehicles-section.component.css']
})
export class MyPublishedVehiclesSectionComponent implements OnInit {
  myPublications: Publication[] = [];
  isLoading = true;
  error: string | null = null;
  private testOwnerId = 'user002';

  constructor(private publicationService: PublicationService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.error = null;
    this.publicationService.getPublicationsByOwnerId(this.testOwnerId).subscribe({
      next: data => {
        this.myPublications = data.slice(0, 4);
        this.isLoading = false;
      },
      error: err => {
        this.error = 'No se pudieron cargar tus publicaciones.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
