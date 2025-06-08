import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { Publication} from '../../../publications/model/publication.entity';
import { Rental} from '../../../rental/model/rental.entity';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './vehicle-card.component.html',
  styleUrls: ['./vehicle-card.component.css']
})
export class VehicleCardComponent implements OnInit, OnChanges {
  @Input() publicacion?: Publication;
  @Input() alquiler?: Rental;

  cardImageUrl: string = 'https://placehold.co/400x300/CCCCCC/000000?text=No+Image';
  cardTitle: string = 'Vehículo Desconocido';
  cardPriceOrStatus: string = '';
  cardDates: string = '';
  cardLocation: string = '';
  cardRouterLink: string | null = null;
  showRentButton: boolean = false;
  showManageButton: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.updateCardDetails();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['publicacion'] || changes['alquiler']) {
      this.updateCardDetails();
    }
  }

  private updateCardDetails(): void {
    if (this.publicacion) {
      this.cardImageUrl = this.publicacion.vehicle?.mainImageUrl || 'https://placehold.co/400x300/CCCCCC/000000?text=No+Image';
      this.cardTitle = `${this.publicacion.vehicle?.make || 'Marca'} ${this.publicacion.vehicle?.model || 'Modelo'} (${this.publicacion.vehicle?.year || 'Año'})`;
      this.cardPriceOrStatus = `$${this.publicacion.dailyPrice} / día`;
      this.cardLocation = this.publicacion.pickupLocation?.city || 'Ubicación Desconocida';
      this.cardRouterLink = `/rent-vehicle/${this.publicacion.id}`;
      this.showRentButton = true;
      this.showManageButton = false;
      this.cardDates = '';
    } else if (this.alquiler) {
      this.cardImageUrl = this.alquiler.publicacion?.vehicle?.mainImageUrl || 'https://placehold.co/400x300/CCCCCC/000000?text=No+Image';
      this.cardTitle = `${this.alquiler.publicacion?.vehicle?.make || 'Marca'} ${this.alquiler.publicacion?.vehicle?.model || 'Modelo'} (${this.alquiler.publicacion?.vehicle?.year || 'Año'})`;
      this.cardPriceOrStatus = `Estado: ${this.alquiler.status}`;
      const startDate = new Date(this.alquiler.startDate);
      const endDate = new Date(this.alquiler.endDate);
      this.cardDates = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      this.cardLocation = this.alquiler.pickupLocation?.city || 'Ubicación Desconocida';
      this.cardRouterLink = `/my-bookings/details/${this.alquiler.id}`;
      this.showRentButton = false;
      this.showManageButton = true;
    } else {
      this.cardImageUrl = 'https://placehold.co/400x300/CCCCCC/000000?text=No+Data';
      this.cardTitle = 'No hay datos de vehículo';
      this.cardPriceOrStatus = '';
      this.cardDates = '';
      this.cardLocation = '';
      this.cardRouterLink = null;
      this.showRentButton = false;
      this.showManageButton = false;
    }
  }
}
