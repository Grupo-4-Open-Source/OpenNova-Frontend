import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VehicleService} from '../services/vehicle.service';
import { Vehicle} from '../../publications/model/vehicle.entity';
import { nanoid } from 'nanoid'; // If using client-side UUIDs for new vehicles
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register-vehicle',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatSnackBarModule,
    ],
  templateUrl: './register-vehicle.component.html',
  styleUrls: ['./register-vehicle.component.css']
})
export class RegisterVehicleComponent implements OnInit, OnDestroy {
  vehicleForm: FormGroup;
  vehicleTypes: string[] = ['SEDAN', 'SUV', 'HATCHBACK', 'COUPE', 'ELECTRIC', 'TRUCK', 'MOTORCYCLE'];
  fuelTypes: string[] = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'];
  isLoading: boolean = false;
  imagePreviewUrl: string = '';

  private formSubscription: Subscription = new Subscription();
  private testOwnerId: string = '1';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private vehicleService: VehicleService,
    private router: Router
  ) {
    this.vehicleForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: [null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      color: ['', Validators.required],
      licensePlate: ['', Validators.required],
      currentMileage: [null, [Validators.required, Validators.min(0)]],
      vehicleType: ['', Validators.required],
      fuelType: ['', Validators.required],
      passengerCapacity: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
      description: ['', Validators.required],
      mainImageUrl: ['', [Validators.required, Validators.pattern(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i)]],
      galleryImageUrls: ['']
    });
  }

  ngOnInit(): void {
    this.formSubscription.add(this.vehicleForm.get('mainImageUrl')?.valueChanges.subscribe(url => {
      this.imagePreviewUrl = url;
    }));
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }

  async onSubmit(): Promise<void> {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      this.snackBar.open('Por favor, completa todos los campos requeridos correctamente.', 'Cerrar', { panelClass: ['error-snackbar'] });
      return;
    }

    this.isLoading = true;

    try {
      const newVehicleData: Vehicle = {
        id: 0,
        ownerId: this.testOwnerId,
        make: this.vehicleForm.get('make')?.value,
        model: this.vehicleForm.get('model')?.value,
        year: this.vehicleForm.get('year')?.value,
        color: this.vehicleForm.get('color')?.value,
        licensePlate: this.vehicleForm.get('licensePlate')?.value,
        currentMileage: this.vehicleForm.get('currentMileage')?.value,
        vehicleType: this.vehicleForm.get('vehicleType')?.value,
        fuelType: this.vehicleForm.get('fuelType')?.value,
        passengerCapacity: this.vehicleForm.get('passengerCapacity')?.value,
        description: this.vehicleForm.get('description')?.value,
        mainImageUrl: this.vehicleForm.get('mainImageUrl')?.value,
        galleryImageUrls: this.vehicleForm.get('galleryImageUrls')?.value?.split(',').map((url: string) => url.trim()).filter((url: string) => url !== '') || []
      };

      await this.vehicleService.createVehicle(newVehicleData).toPromise();
      this.snackBar.open('Vehículo registrado exitosamente.', 'Cerrar', { panelClass: ['success-snackbar'], duration: 3000 });
      this.vehicleForm.reset();
      this.imagePreviewUrl = ''; // Clear preview
      this.router.navigate(['/publish-vehicle']); // Navigate back to the publish page after successful registration
    } catch (err: any) {
      console.error('Error al registrar el vehículo:', err);
      this.snackBar.open(err.message || 'Ocurrió un error inesperado al registrar el vehículo. Inténtalo de nuevo.', 'Cerrar', { panelClass: ['error-snackbar'] });
    } finally {
      this.isLoading = false;
    }
  }
}
