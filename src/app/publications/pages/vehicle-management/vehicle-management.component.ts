import { Component } from '@angular/core';
import { AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatIconModule } from "@angular/material/icon";
import { VehiclesService } from "../../services/vehicles.service";
import { Vehicle } from "../../model/vehicle.entity";
import { VehicleCreateAndEditComponent } from "../../components/vehicle-create-and-edit/vehicle-create-and-edit.component";
import { NgClass } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [
    MatPaginator,
    MatSort,
    MatIconModule,
    VehicleCreateAndEditComponent,
    MatTableModule,
    NgClass,
    TranslateModule
  ],
  templateUrl: './vehicle-management.component.html',
  styleUrl: './vehicle-management.component.css'
})
export class VehicleManagementComponent implements OnInit, AfterViewInit {
  vehicleData: Vehicle;
  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = ['id', 'model', 'brand', 'year', 'description', 'image', 'price', 'actions'];
  isEditMode: boolean;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(private vehicleService: VehiclesService) {
    this.isEditMode = false;
    this.vehicleData = {} as Vehicle;
    this.dataSource = new MatTableDataSource<any>();
  }

  private resetEditState(): void {
    this.isEditMode = false;
    this.vehicleData = {} as Vehicle;
  }

  private getAllVehicles(): void {
    this.vehicleService.getAll()
      .subscribe((response: any) => {
        this.dataSource.data = response;
      });
  }

  private createVehicle(): void {
    this.vehicleService.create(this.vehicleData)
      .subscribe((response: any) => {
        this.dataSource.data.push({ ...response });
        this.dataSource.data = this.dataSource.data.map(vehicle => vehicle);
      });
  }

  private updateVehicle(): void {
    const vehicleToUpdate: Vehicle = this.vehicleData;
    this.vehicleService.update(this.vehicleData.id, vehicleToUpdate)
      .subscribe((response: any) => {
        this.dataSource.data = this.dataSource.data.map((vehicle: Vehicle) =>
          vehicle.id === response.id ? response : vehicle
        );
      });
  }

  private deleteVehicle(vehicleId: number): void {
    this.vehicleService.delete(vehicleId)
      .subscribe(() => {
        this.dataSource.data = this.dataSource.data.filter((vehicle: Vehicle) =>
          vehicle.id !== vehicleId
        );
      });
  }

  onEditItem(element: Vehicle) {
    this.isEditMode = true;
    this.vehicleData = element;
  }

  onDeleteItem(element: Vehicle) {
    this.deleteVehicle(element.id);
  }

  onCancelEdit() {
    this.resetEditState();
    this.getAllVehicles();
  }

  onVehicleAdded(element: Vehicle) {
    this.vehicleData = element;
    this.createVehicle();
    this.resetEditState();
  }

  onVehicleUpdated(element: Vehicle) {
    this.vehicleData = element;
    this.updateVehicle();
    this.resetEditState();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.getAllVehicles();
  }
}
