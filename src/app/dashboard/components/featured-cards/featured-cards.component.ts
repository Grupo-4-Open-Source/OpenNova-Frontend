import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PublishedVehicles } from '../../../navigation/model/published-vehicles.entity';
import { FeaturedVehiclesService } from '../../services/featured-vehicles.service';
import { Router } from '@angular/router';

interface RatedVehicle extends PublishedVehicles {
  rating?: number;
}

@Component({
  selector: 'app-featured-cards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './featured-cards.component.html',
  styleUrls: ['./featured-cards.component.css']
})
export class FeaturedCardsComponent implements OnInit {
  vehicles: RatedVehicle[] = [];
  displayedVehicles: RatedVehicle[] = [];
  @Input() limit: number = 4;

  constructor(
    private featuredVehiclesService: FeaturedVehiclesService,
    private router: Router) {}

  ngOnInit(): void {
    this.getFeaturedVehicles();
  }

  private getFeaturedVehicles(): void {
    this.featuredVehiclesService.getAll().subscribe((response: any) => {
      this.vehicles = response;
      this.vehicles.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      this.displayedVehicles = this.vehicles.slice(0, this.limit);
    });
  }

  showAll(): void {
    this.router.navigate(['/navigation']);
  }
}
