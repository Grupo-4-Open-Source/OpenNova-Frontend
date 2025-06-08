import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
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
    MatButtonModule
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

  constructor(private publicacionService: PublicationService) { }

  ngOnInit(): void {
   this.getAvailableVehicles()
  }

  private getAvailableVehicles(): void {
    this.isLoading = true;
    this.error = null;

    this.publicacionService.getAvailablePublications().pipe(
      catchError(err => {
        this.error = 'Unable to load available vehicles.';
        this.isLoading = false;
        console.error(err);
        return of([]);
      })
    ).subscribe(data => {
      this.allAvailableVehicles = data;
      this.availableVehicles = [...this.allAvailableVehicles]
        .sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime())
        .slice(0, this.displayLimit);
      this.isLoading = false;
    });
  }
}
