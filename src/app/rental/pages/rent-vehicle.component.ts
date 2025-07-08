import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PublicationService } from '../../publications/services/publication.service';
import { RentalService } from '../services/rental.service';
import { Publication } from '../../publications/model/publication.entity';
import { Rental } from '../model/rental.entity'; 
import { nanoid } from 'nanoid';
import { InsuranceService } from '../services/insurance.service';
import { VehicleService } from '../../vehicle/services/vehicle.service';
import { LocationService } from '../../publications/services/location.service';
import { Insurance } from '../model/insurance.entity';
import { Vehicle} from '../../vehicle/model/vehicle.entity'; 
import { Location } from '../../publications/model/location.entity'; 
import { switchMap, filter, take, catchError, map } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-rent-vehicle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonModule,
    NgClass 
  ],
  templateUrl: './rent-vehicle.component.html',
  styleUrls: ['./rent-vehicle.component.css']
})
export class RentVehicleComponent implements OnInit {
  publicacionExternalId: string | null = null;
  publication: Publication | undefined;
  vehicleDetails: Vehicle | undefined;
  pickupLocationDetails: Location | undefined;
  rentForm: FormGroup;
  totalCost: number = 0;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  todayDate: string;

  private testRenterId: string = 'user001';
  private testInsuranceId: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private publicacionService: PublicationService,
    private alquilerService: RentalService,
    private vehicleService: VehicleService,
    private locationService: LocationService,
    private insuranceService: InsuranceService,
    private snackBar: MatSnackBar
  ) {
    this.rentForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    this.todayDate = new Date().toISOString().split('T')[0];
    this.rentForm.valueChanges.subscribe(() => this.validateAndCalculateCost());
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('publicacionId')),
      filter((id): id is string => !!id), 
      switchMap(externalIdFromRoute => { // CAMBIO: Renombrado para claridad
        this.publicacionExternalId = externalIdFromRoute; 
        this.isLoading = true;
        return this.publicacionService.getPublicationByExternalId(externalIdFromRoute).pipe(
          catchError(err => {
            this.errorMessage = 'Error al cargar los detalles de la publicación o publicación no encontrada.';
            this.isLoading = false;
            console.error('Error fetching publication:', err);
            this.snackBar.open('Error al cargar la publicación.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
            this.router.navigate(['/dashboard']);
            return of(undefined);
          })
        );
      }),
      filter((publication): publication is Publication => !!publication),
      switchMap(publication => {
        this.publication = publication;
        const vehicleRequest = this.vehicleService.getVehicleById(publication.vehicleId).pipe(
          catchError(err => {
            console.error('Error fetching vehicle details:', err);
            this.errorMessage = 'Error al cargar los detalles del vehículo.';
            return of(undefined);
          })
        );
        const locationRequest = this.locationService.getLocationById(publication.pickupLocationId).pipe(
          catchError(err => {
            console.error('Error fetching location details:', err);
            this.errorMessage = 'Error al cargar los detalles de la ubicación.';
            return of(undefined);
          })
        );

        return forkJoin({
          vehicle: vehicleRequest,
          location: locationRequest
        });
      }),
      take(1)
    ).subscribe({
      next: (data) => {
        this.vehicleDetails = data.vehicle;
        this.pickupLocationDetails = data.location;
        if (!this.vehicleDetails || !this.pickupLocationDetails) {
          this.errorMessage = 'No se pudieron cargar todos los detalles necesarios para la publicación.';
          this.snackBar.open('Publicación incompleta o datos relacionados faltantes.', 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar detalles adicionales de la publicación.';
        this.isLoading = false;
        console.error('Error fetching related data:', err);
        this.snackBar.open('Error al cargar detalles adicionales.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  validateAndCalculateCost(): void {
    const startDate = this.rentForm.get('startDate')?.value;
    const endDate = this.rentForm.get('endDate')?.value;

    if (!startDate || !endDate || !this.publication) {
      this.totalCost = 0;
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date(this.todayDate);

    this.rentForm.get('startDate')?.setErrors(null);
    this.rentForm.get('endDate')?.setErrors(null);

    if (start.getTime() < today.getTime()) {
      this.rentForm.get('startDate')?.setErrors({ 'startDatePast': true });
      this.totalCost = 0;
      return;
    }

    if (end.getTime() < start.getTime()) {
      this.rentForm.get('endDate')?.setErrors({ 'endDateBeforeStart': true });
      this.totalCost = 0;
      return;
    }

    const minDays = 1;
    const maxDays = 365;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    let rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (rentalDays === 0) rentalDays = 1;

    if (rentalDays < minDays) {
      this.rentForm.get('startDate')?.setErrors({ 'rentalDaysTooShort': { min: minDays, actual: rentalDays } });
      this.rentForm.get('endDate')?.setErrors({ 'rentalDaysTooShort': { min: minDays, actual: rentalDays } });
      this.totalCost = 0;
      return;
    }

    if (rentalDays > maxDays) {
      this.rentForm.get('startDate')?.setErrors({ 'rentalDaysTooLong': { max: maxDays, actual: rentalDays } });
      this.rentForm.get('endDate')?.setErrors({ 'rentalDaysTooLong': { max: maxDays, actual: rentalDays } });
      this.totalCost = 0;
      return;
    }

    if (this.rentForm.valid && this.publication) {
      this.totalCost = rentalDays * this.publication.dailyPrice;
      const insuranceDailyCost = 5;
      const insuranceCost = insuranceDailyCost * rentalDays;
      const platformCommissionRate = 0.1;
      const platformCommission = (this.totalCost + insuranceCost) * platformCommissionRate;

      this.totalCost = this.totalCost + insuranceCost + platformCommission;
    } else {
      this.totalCost = 0;
    }
  }

  onSubmit(): void {
    if (this.rentForm.invalid || !this.publication || this.totalCost <= 0) {
      this.errorMessage = 'Por favor, completa correctamente todos los campos y asegúrate de que el costo total sea válido.';
      this.rentForm.markAllAsTouched();
      this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const bookingDate = new Date().toISOString();

    const startDate = this.rentForm.value.startDate;
    const endDate = this.rentForm.value.endDate;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    let rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (rentalDays === 0) rentalDays = 1;

    const baseCostCalc = this.publication.dailyPrice * rentalDays;
    const insuranceCostCalc = 5 * rentalDays;
    const platformCommissionCalc = (baseCostCalc + insuranceCostCalc) * 0.1;
    const totalCostCalc = baseCostCalc + insuranceCostCalc + platformCommissionCalc;

    const alquilerData: Rental = {
      id: 0,
      // CORRECCIÓN: Asignar externalId (string) a publicationId (string)
      publicationId: this.publication.externalId,
      renterId: this.testRenterId,
      insuranceId: this.testInsuranceId,
      bookingDate: bookingDate,
      startDate: startDate,
      endDate: endDate,
      baseCost: parseFloat(baseCostCalc.toFixed(2)),
      insuranceCost: parseFloat(insuranceCostCalc.toFixed(2)),
      platformCommission: parseFloat(platformCommissionCalc.toFixed(2)),
      totalCost: parseFloat(totalCostCalc.toFixed(2)),
      pickupMileage: this.vehicleDetails?.currentMileage || 0,
      dropoffMileage: null,
      status: 'PENDING_OWNER_APPROVAL',
      pickupLocationId: this.publication.pickupLocationId,
      dropoffLocationId: this.publication.pickupLocationId,
    };

    this.alquilerService.createRental(alquilerData).subscribe({
      next: (alquiler) => {
        this.successMessage = `¡Alquiler confirmado con ID: ${alquiler.id}!`;
        this.isLoading = false;
        this.snackBar.open('¡Alquiler confirmado exitosamente!', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
        this.rentForm.reset();
        this.totalCost = 0;
        this.router.navigate(['/my-bookings']);
      },
      error: (err) => {
        this.errorMessage = 'Error al procesar el alquiler. Inténtalo de nuevo.';
        this.isLoading = false;
        console.error('Error al crear alquiler:', err);
        this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }
}
