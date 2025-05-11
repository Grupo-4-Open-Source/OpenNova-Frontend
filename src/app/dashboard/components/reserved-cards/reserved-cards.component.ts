import { Component, OnInit } from '@angular/core';
import { ReservedService } from '../../services/reserved.service';
import { PublishedVehicles } from '../../../navigation/model/published-vehicles.entity';
import {CurrencyPipe, NgForOf} from '@angular/common';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardTitle
} from '@angular/material/card';

@Component({
  selector: 'app-reserved-cards',
  templateUrl: './reserved-cards.component.html',
  imports: [
    CurrencyPipe,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardImage,
    MatCardTitle,
    NgForOf
  ],
  styleUrls: ['./reserved-cards.component.css']
})
export class ReservedCardsComponent implements OnInit {
  vehicles: PublishedVehicles[] = [];
  displayedVehicles: PublishedVehicles[] = [];
  limit = 4;

  constructor(private reservedService: ReservedService) {}

  ngOnInit(): void {
    this.getReservedVehicles();
  }

  private getReservedVehicles(): void {
    this.reservedService.getAll().subscribe((response: any) => {
      this.vehicles = response;
      this.displayedVehicles = this.vehicles.reverse().slice(0, this.limit);
    });
  }

  showAll(): void {
    this.displayedVehicles = this.vehicles.reverse();
  }
}
