import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { Publication} from '../../../publications/model/publication.entity';
import { Rental} from '../../../rental/model/rental.entity';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../../publications/model/vehicle.entity';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule
  ],
  providers: [DatePipe],
  templateUrl: './vehicle-card.component.html',
  styleUrls: ['./vehicle-card.component.css']
})
export class VehicleCardComponent implements OnInit, OnChanges {
  @Input() publicacion?: Publication;
  @Input() alquiler?: Rental;
  @Input() relatedPublicationForRental?: Publication;

  cardImageUrl: string = 'https://placehold.co/400x300/CCCCCC/000000?text=No+Image';
  cardTitle: string = 'Vehículo Desconocido';
  cardPriceOrStatus: string = '';
  cardDates: string = '';
  cardLocation: string = '';
  cardRouterLink: string | null = null;
  showRentButton: boolean = false;
  showManageButton: boolean = false;

  private currentVehicleId: number | undefined;

  constructor(
    private datePipe: DatePipe,
    private vehicleService: VehicleService
  ) { }

  ngOnInit(): void {
    this.updateCardDetails();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['publicacion'] || changes['alquiler'] || changes['relatedPublicationForRental']) {
      this.updateCardDetails();
    }
  }

  private updateCardDetails(): void {
    let sourcePublication: Publication | undefined;
    let isRentalContext = false;

    if (this.publicacion) {
      sourcePublication = this.publicacion;
      this.showRentButton = true;
      this.showManageButton = false;
      this.cardRouterLink = `/rent-vehicle/${this.publicacion.id}`;
      this.cardPriceOrStatus = `$${this.publicacion.dailyPrice} / día`;
      this.cardDates = '';
    } else if (this.alquiler && this.relatedPublicationForRental) {
      sourcePublication = this.relatedPublicationForRental;
      isRentalContext = true;
      this.showRentButton = false;
      this.showManageButton = true;
      this.cardRouterLink = `/my-bookings/details/${this.alquiler.id}`;
      this.cardPriceOrStatus = `Estado: ${this.alquiler.status}`;
      const startDate = new Date(this.alquiler.startDate);
      const endDate = new Date(this.alquiler.endDate);
      this.cardDates = `${this.datePipe.transform(startDate, 'shortDate')} - ${this.datePipe.transform(endDate, 'shortDate')}`;
    } else {
      this.resetCardDetails();
      return;
    }

    this.cardTitle = `${sourcePublication.vehicleMake || 'Marca'} ${sourcePublication.vehicleModel || 'Modelo'}`;
    this.cardLocation = sourcePublication.pickupLocationAddressSummary || 'Ubicación Desconocida';

    if (sourcePublication.vehicleId && sourcePublication.vehicleId !== this.currentVehicleId) {
      this.currentVehicleId = sourcePublication.vehicleId;
      this.vehicleService.getVehicleById(sourcePublication.vehicleId).pipe(
        catchError(err => {
          console.error(`Error al cargar la imagen del vehículo ${sourcePublication?.vehicleId}:`, err);
          return of(undefined);
        })
      ).subscribe(vehicle => {
        if (vehicle && vehicle.mainImageUrl) {
          this.cardImageUrl = vehicle.mainImageUrl;
        } else {
          this.cardImageUrl = 'https://placehold.co/400x300/CCCCCC/000000?text=No+Image';
        }
      });
    } else if (!sourcePublication.vehicleId) {
      this.cardImageUrl = 'https://placehold.co/400x300/CCCCCC/000000?text=No+Image';
    }
  }

  private resetCardDetails(): void {
    this.cardImageUrl = 'https://placehold.co/400x300/CCCCCC/000000?text=No+Data';
    this.cardTitle = 'No hay datos de vehículo';
    this.cardPriceOrStatus = '';
    this.cardDates = '';
    this.cardLocation = '';
    this.cardRouterLink = null;
    this.showRentButton = false;
    this.showManageButton = false;
    this.currentVehicleId = undefined;
  }
}
