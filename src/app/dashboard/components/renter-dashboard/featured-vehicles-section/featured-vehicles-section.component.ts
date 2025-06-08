import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button'; // Importa MatButtonModule
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
    VehicleCardComponent
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

  constructor(private publicacionService: PublicationService) { }

  ngOnInit(): void {
    this.getFeaturedVehicles();
  }

  private getFeaturedVehicles(): void {
    this.isLoading = true;
    this.error = null;

    this.publicacionService.getFeaturedPublications().pipe(
      catchError(err => {
        this.error = 'Unable to load featured vehicles.';
        this.isLoading = false;
        console.error(err);
        return of([]);
      })
    ).subscribe(data => {
      this.allFeaturedVehicles = data;
      this.featuredVehicles = [...this.allFeaturedVehicles]
        .sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime())
        .slice(0, this.displayLimit);
      this.isLoading = false;
    });
  }

}
