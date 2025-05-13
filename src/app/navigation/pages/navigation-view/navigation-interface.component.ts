import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../services/navigation.service';
import { PublishedVehicles } from '../../model/published-vehicles.entity';
import { TranslateModule } from "@ngx-translate/core";
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { RatingDialogComponent } from '../../components/rating-dialog/rating-dialog.component';
import { BookedVehicles } from '../../model/booked-vehicles.entity';

@Component({
  selector: 'app-navigation-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    TranslateModule,
    MatButtonModule,
    MatDialogModule,
    RatingDialogComponent
  ],
  templateUrl: './navigation-interface.component.html',
  styleUrls: ['./navigation-interface.component.css']
})
export class NavigationViewComponent implements OnInit {
  publishedVehiclesData: PublishedVehicles;
  dataSource!: MatTableDataSource<any>;
  originalData: any[] = [];
  isDescending: boolean = true;

  constructor(
    private navigationService: NavigationService,
    private dialog: MatDialog,
    private http: HttpClient
  ) {
    this.publishedVehiclesData = {} as PublishedVehicles;
    this.dataSource = new MatTableDataSource<any>();
  }


  private getAllPublishedVehicles(): void {
    this.navigationService.getAll()
      .subscribe((response: any) => {
        this.originalData = [...response];
        this.dataSource.data = response;
      });
  }
  reserveVehicle(vehicle: PublishedVehicles): void {
    const bookedVehicle = new BookedVehicles();
    Object.assign(bookedVehicle, vehicle); // Copia los atributos

    this.http.post('http://localhost:3000/myBookedVehicles', bookedVehicle).subscribe({
      next: () => alert('Vehículo reservado con éxito'),
      error: (err) => {
        console.error('Error al reservar el vehículo:', err);
        alert('Error al reservar el vehículo. Por favor, intenta nuevamente.');
      }
    });
  }

  toggleSortOrder(): void {
    this.isDescending = !this.isDescending;
    this.dataSource.data = this.dataSource.data.sort((a, b) =>
      this.isDescending ? b.price - a.price : a.price - b.price
    );
  }

  resetOrder(): void {
    this.dataSource.data = [...this.originalData];
  }

  openRatingDialog(vehicle: any): void {
    const dialogRef = this.dialog.open(RatingDialogComponent, {
      width: '400px', // Ajusta el ancho
      height: '300px', // Ajusta la altura
      data: { vehicle },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        vehicle.rating = result;
        this.updateRating(vehicle.id, result);
      }
    });
  }



  private updateRating(id: number, rating: number): void {
    this.http.patch(`http://localhost:3000/publishedVehicles/${id}`, { rating }).subscribe();
  }

  ngOnInit(): void {
    this.getAllPublishedVehicles();
  }
}
