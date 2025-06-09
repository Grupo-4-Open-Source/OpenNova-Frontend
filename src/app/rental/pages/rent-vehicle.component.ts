import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PublicationService} from '../../publications/services/publication.service';
import { RentalService} from '../services/rental.service';
import { Publication} from '../../publications/model/publication.entity';
import { Rental} from '../model/rental.entity';
import { nanoid } from 'nanoid';
import { Insurance} from '../model/insurance.entity';
import { switchMap, filter, take, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
  selector: 'app-rent-vehicle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './rent-vehicle.component.html',
  styleUrls: ['./rent-vehicle.component.css']
})
export class RentVehicleComponent implements OnInit {
  publicacionId: string | null = null;
  publication: Publication | undefined;
  rentForm: FormGroup;
  totalCost: number = 0;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private testRenterId: string = 'user001';
  private testInsuranceId: string = 'ins001';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private publicacionService: PublicationService,
    private alquilerService: RentalService
  ) {
    this.rentForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    this.rentForm.valueChanges.subscribe(() => this.calculateTotalCost());
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('publicacionId')),
      filter((id): id is string => !!id),
      switchMap(id => {
        this.publicacionId = id;
        return this.publicacionService.getPublicationById(id);
      }),
      take(1),
      catchError(err => {
        this.errorMessage = 'Error al cargar los detalles de la publicación o publicación no encontrada.';
        this.isLoading = false;
        console.error(err);
        this.router.navigate(['/dashboard']);
        return of(undefined);
      })
    ).subscribe(data => {
      if (data) {
        this.publication = data;
        this.isLoading = false;
      } else {

        this.errorMessage = 'Publicación no encontrada.';
        this.isLoading = false;
      }
    });
  }

  calculateTotalCost(): void {
    const startDate = this.rentForm.get('startDate')?.value;
    const endDate = this.rentForm.get('endDate')?.value;

    if (this.publication && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        this.totalCost = diffDays * this.publication.dailyPrice;
        const insuranceDailyCost = 5;
        const insuranceCost = insuranceDailyCost * diffDays;
        const platformCommissionRate = 0.1;
        const platformCommission = this.totalCost * platformCommissionRate;

        this.totalCost = this.totalCost + insuranceCost + platformCommission;
      } else {
        this.totalCost = 0;
      }
    } else {
      this.totalCost = 0;
    }
  }

  onSubmit(): void {
    if (this.rentForm.invalid || !this.publication || this.totalCost <= 0) {
      this.errorMessage = 'Por favor, completa correctamente todos los campos y asegúrate de que el costo total sea válido.';
      this.rentForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const newAlquilerId = nanoid();
    const bookingDate = new Date().toISOString();

    const alquilerData: Rental = {
      id: newAlquilerId,
      publicationId: this.publication.id,
      renterId: this.testRenterId,
      insuranceId: this.testInsuranceId,
      bookingDate: bookingDate,
      startDate: this.rentForm.value.startDate,
      endDate: this.rentForm.value.endDate,
      baseCost: this.publication.dailyPrice * Math.ceil((new Date(this.rentForm.value.endDate).getTime() - new Date(this.rentForm.value.startDate).getTime()) / (1000 * 3600 * 24)),
      insuranceCost: 5 * Math.ceil((new Date(this.rentForm.value.endDate).getTime() - new Date(this.rentForm.value.startDate).getTime()) / (1000 * 3600 * 24)),
      platformCommission: this.totalCost * 0.1,
      totalCost: this.totalCost,
      pickupMileage: this.publication.vehicle?.currentMileage || 0,
      dropoffMileage: null,
      status: 'PENDING_OWNER_APPROVAL',
      pickupLocationId: this.publication.pickupLocation?.id || '',
      dropoffLocationId: this.publication.pickupLocation?.id || '',
      publication: undefined,
      renter: undefined,
      insurance: undefined,
      pickupLocation: undefined,
      dropoffLocation: undefined
    };

    this.alquilerService.createRental(alquilerData).subscribe({
      next: (alquiler) => {
        this.successMessage = `¡Alquiler confirmado con ID: ${alquiler.id}!`;
        this.isLoading = false;
        this.rentForm.reset();
        this.totalCost = 0;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Error al procesar el alquiler. Inténtalo de nuevo.';
        this.isLoading = false;
        console.error('Error al crear alquiler:', err);
      }
    });
  }
}
