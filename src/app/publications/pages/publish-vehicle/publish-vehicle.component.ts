import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription, of } from 'rxjs';
import { nanoid } from 'nanoid';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { PublicationService} from '../../services/publication.service';
import { VehicleService} from '../../../vehicle/services/vehicle.service';
import { LocationService} from '../../services/location.service';

import { Vehicle} from '../../model/vehicle.entity';
import { Publication} from '../../model/publication.entity';
import { Location} from '../../model/location.entity';
import { switchMap, take, catchError, map, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-publish-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      <div *ngIf="data.isSuccess" style="color: green; font-weight: bold;">¡Operación exitosa!</div>
      <div *ngIf="!data.isSuccess" style="color: red; font-weight: bold;">Error en la operación.</div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close cdkFocusInitial>Cerrar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule]
})
export class PublishDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string,
      message: string,
      isSuccess: boolean
    }) {}
}


@Component({
  selector: 'app-publish-vehicle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './publish-vehicle.component.html',
  styleUrls: ['./publish-vehicle.component.css']
})
export class PublishVehicleComponent implements OnInit, OnDestroy {
  publishForm: FormGroup;
  unpublishedVehicles: Vehicle[] = [];
  locations: Location[] = [];
  isLoading: boolean = false;

  private formSubscription: Subscription = new Subscription();

  private testOwnerId: string = '1';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private publicacionService: PublicationService,
    private vehicleService: VehicleService,
    private locationService: LocationService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.publishForm = this.fb.group({
      vehicleSelectionMode: ['existing', Validators.required],
      existingVehicleId: ['', Validators.required], // Now always required if 'existing' mode is selected
      publicacionDetails: this.fb.group({
        title: ['', Validators.required],
        dailyPrice: [null, [Validators.required, Validators.min(0.01)]],
        weeklyPrice: [null, Validators.min(0)],
        minRentalDays: [1, [Validators.required, Validators.min(1)]],
        maxRentalDays: [30, [Validators.required, Validators.min(1)]],
        carRules: ['', Validators.required],
        pickupLocationId: ['', Validators.required],
        isFeatured: [false]
      })
    });
  }

  ngOnInit(): void {
    this.loadUnpublishedVehicles();
    this.loadLocations();

    this.formSubscription.add(this.publishForm.get('vehicleSelectionMode')?.valueChanges.subscribe(mode => {
      // If 'new' is selected, navigate to the new vehicle registration page
      if (mode === 'new') {
        this.router.navigate(['/register-vehicle']); // Adjust this path as needed
        // Reset to 'existing' or another default after navigation if you want to prevent
        // the radio button from staying on 'new'
        this.publishForm.get('vehicleSelectionMode')?.setValue('existing', { emitEvent: false });
      }
      this.toggleExistingVehicleIdControl(mode === 'existing');
    }));
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }

  private loadUnpublishedVehicles(): void {
    this.vehicleService.getUnpublishedVehicles().subscribe({
      next: (data) => {
        this.unpublishedVehicles = data;
        if (this.unpublishedVehicles.length === 0) {
          this.publishForm.get('vehicleSelectionMode')?.setValue('new', { emitEvent: false });
          this.publishForm.get('vehicleSelectionMode')?.disable();
          this.publishForm.get('existingVehicleId')?.disable();
          this.snackBar.open('No hay vehículos sin publicar. Por favor, registra uno nuevo primero.', 'Cerrar', { duration: 5000 });
        } else {
          this.publishForm.get('vehicleSelectionMode')?.enable();
          if (!this.publishForm.get('existingVehicleId')?.value && this.unpublishedVehicles.length > 0) {
             this.publishForm.get('existingVehicleId')?.setValue(this.unpublishedVehicles[0].id);
          }
          this.toggleExistingVehicleIdControl(this.publishForm.get('vehicleSelectionMode')?.value === 'existing');
        }
      },
      error: (err) => {
        console.error('Error al cargar vehículos no publicados:', err);
        this.snackBar.open('Error al cargar la lista de vehículos.', 'Cerrar', { panelClass: ['error-snackbar'] });
      }
    });
  }

  private loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (data) => {
        this.locations = data;
      },
      error: (err) => {
        console.error('Error al cargar ubicaciones:', err);
        this.snackBar.open('Error al cargar la lista de ubicaciones.', 'Cerrar', { panelClass: ['error-snackbar'] });
      }
    });
  }

  get vehicleSelectionModeControl(): AbstractControl | null {
    return this.publishForm.get('vehicleSelectionMode');
  }


  get publicacionDetails(): FormGroup {
    return this.publishForm.get('publicacionDetails') as FormGroup;
  }

  private toggleExistingVehicleIdControl(enable: boolean): void {
    if (enable) {
      this.publishForm.get('existingVehicleId')?.enable();
      this.publishForm.get('existingVehicleId')?.setValidators(Validators.required);
    } else {
      this.publishForm.get('existingVehicleId')?.disable();
      this.publishForm.get('existingVehicleId')?.setValue('');
      this.publishForm.get('existingVehicleId')?.clearValidators();
    }
    this.publishForm.get('existingVehicleId')?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (this.vehicleSelectionModeControl?.value !== 'existing') {
      this.snackBar.open('Selecciona un vehículo existente para publicar.', 'Cerrar', { panelClass: ['error-snackbar'] });
      return;
    }

    if (this.publishForm.invalid) {
      this.publishForm.markAllAsTouched();
      this.snackBar.open('Por favor, completa todos los campos requeridos correctamente.', 'Cerrar', { panelClass: ['error-snackbar'] });
      return;
    }

    this.isLoading = true;
    let vehicleToPublish: Vehicle | undefined;

    try {
      const selectedVehicleId = this.publishForm.get('existingVehicleId')?.value;
      if (!selectedVehicleId) {
        throw new Error('Debes seleccionar un vehículo existente.');
      }
      // Fetch the selected vehicle to ensure it's still unpublished and get its details
      // No need for toPromise(). Just subscribe.
      vehicleToPublish = await this.vehicleService.getVehicleById(selectedVehicleId).toPromise();

      if (!vehicleToPublish) {
        throw new Error('Vehículo existente no encontrado o ya publicado.');
      }

      const selectedLocation = this.locations.find(loc => loc.id === this.publicacionDetails.get('pickupLocationId')?.value);
      if (!selectedLocation) {
        throw new Error('La ubicación de recogida seleccionada no es válida.');
      }

      const publicacionData: Publication = {
        id: 0,
        externalId: nanoid(),
        title: this.publicacionDetails.get('title')?.value,
        description: '',
        dailyPrice: this.publicacionDetails.get('dailyPrice')?.value,
        weeklyPrice: this.publicacionDetails.get('weeklyPrice')?.value,
        vehicleId: vehicleToPublish.id,
        ownerId: this.testOwnerId,
        pickupLocationId: selectedLocation.id,
        carRules: this.publicacionDetails.get('carRules')?.value,
        status: 'ACTIVE',
        isFeatured: this.publicacionDetails.get('isFeatured')?.value,
        availableFrom: new Date().toISOString(),
        availableUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Example: Available for 1 year from now
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        vehicleMake: vehicleToPublish.make,
        vehicleModel: vehicleToPublish.model,
        mainImageUrl: vehicleToPublish.mainImageUrl,
        ownerFullName: 'Owner Name Placeholder',
        pickupLocationAddressSummary: selectedLocation.addressLine1 + ', ' + selectedLocation.city // Concatenate for summary
      };

      await this.publicacionService.createPublication(publicacionData).toPromise();
      this.dialog.open(PublishDialogComponent, {
        data: { title: 'Publicación Exitosa', message: 'Tu vehículo ha sido publicado exitosamente.', isSuccess: true }
      });
      this.publishForm.reset();
      this.resetFormState();
    } catch (err: any) {
      console.error('Error en el flujo de publicación:', err);
      this.dialog.open(PublishDialogComponent, {
        data: { title: 'Error de Publicación', message: err.message || 'Ocurrió un error inesperado al publicar el vehículo. Inténtalo de nuevo.', isSuccess: false }
      });
    } finally {
      this.isLoading = false;
    }
  }

  private resetFormState(): void {
    this.publishForm.reset({
      vehicleSelectionMode: 'existing',
      existingVehicleId: '', // Clear selected existing vehicle
      publicacionDetails: {
        title: '', dailyPrice: null, weeklyPrice: null, minRentalDays: 1, maxRentalDays: 30,
        carRules: '', pickupLocationId: '', isFeatured: false
      }
    });
    this.loadUnpublishedVehicles();
    this.toggleExistingVehicleIdControl(true);
    this.publishForm.get('vehicleSelectionMode')?.enable(); // Ensure radio buttons are enabled
  }

  get selectedExistingVehicle(): Vehicle | undefined {
    const selectedId = this.publishForm.get('existingVehicleId')?.value;
    return this.unpublishedVehicles.find(v => v.id === selectedId);
  }
}
