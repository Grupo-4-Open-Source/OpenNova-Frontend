import { Component, OnInit } from '@angular/core';
import { ReservedService } from '../../../services/reserved.service';
import { PublishedVehicles } from '../../../../navigation/model/published-vehicles.entity';
import { CurrencyPipe, NgForOf, NgIf, NgClass } from '@angular/common';
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
import { CancelDialogComponent } from '../../cancel-dialog/cancel-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reserved-cards',
  standalone: true,
  templateUrl: './booked-vehicles-section.component.html',
  styleUrls: ['./booked-vehicles-section.component.css'],
  imports: [
    CurrencyPipe,
    NgForOf,
    NgIf,
    NgClass,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardImage,
    MatCardTitle,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    CancelDialogComponent
  ]
})
export class BookedVehiclesSectionComponent implements OnInit {
  vehicles: PublishedVehicles[] = [];
  displayedVehicles: PublishedVehicles[] = [];
  selectedVehicles: Set<number> = new Set();
  isMultiSelectMode = false;
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

  showAll(): void {
    this.router.navigate(['/']);
  }

  toggleMultiSelect(): void {
    this.isMultiSelectMode = !this.isMultiSelectMode;
    if (!this.isMultiSelectMode) {
      this.selectedVehicles.clear();
    }
  }

  toggleSelection(id: number): void {
    if (this.selectedVehicles.has(id)) {
      this.selectedVehicles.delete(id);
    } else {
      this.selectedVehicles.add(id);
    }
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

  confirmBatchCancel(): void {
    const dialogRef = this.dialog.open(CancelDialogComponent, {
      width: '300px',
      data: { vehicle: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const idsToDelete = Array.from(this.selectedVehicles);
        const deleteRequests = idsToDelete.map(id => this.reservedService.delete(id));
        Promise.all(deleteRequests.map(req => req.toPromise())).then(() => {
          this.displayedVehicles = this.displayedVehicles.filter(v => !this.selectedVehicles.has(v.id));
          this.selectedVehicles.clear();
          this.isMultiSelectMode = false;
        });
      }
    });
  }
}
