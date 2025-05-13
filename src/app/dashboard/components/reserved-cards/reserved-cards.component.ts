import { Component, OnInit } from '@angular/core';
import { ReservedService } from '../../services/reserved.service';
import { PublishedVehicles } from '../../../navigation/model/published-vehicles.entity';
import { CurrencyPipe, NgForOf } from '@angular/common';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardTitle
} from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CancelDialogComponent } from '../cancel-dialog/cancel-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reserved-cards',
  standalone: true,
  templateUrl: './reserved-cards.component.html',
  styleUrls: ['./reserved-cards.component.css'],
  imports: [
    CurrencyPipe,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardImage,
    MatCardTitle,
    NgForOf,
    MatButtonModule,
    MatDialogModule,
    CancelDialogComponent
  ]
})
export class ReservedCardsComponent implements OnInit {
  vehicles: PublishedVehicles[] = [];
  displayedVehicles: PublishedVehicles[] = [];
  limit = 4;

  constructor(
    private reservedService: ReservedService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getReservedVehicles();
  }

  private getReservedVehicles(): void {
    this.reservedService.getAll().subscribe((response: any) => {
      this.vehicles = response;
      this.displayedVehicles = this.vehicles.reverse().slice(0, this.limit);
    });
  }

  cancelReservation(vehicle: PublishedVehicles): void {
    const dialogRef = this.dialog.open(CancelDialogComponent, {
      width: '300px',
      data: { vehicle }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservedService.delete(vehicle.id).subscribe(() => {
          this.displayedVehicles = this.displayedVehicles.filter(v => v.id !== vehicle.id);
        });
      }
    });
  }

  showAll(): void {
    this.router.navigate(['/']);
  }
}
