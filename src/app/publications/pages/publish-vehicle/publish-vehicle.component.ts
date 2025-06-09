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

import { PublicationService} from '../../services/publication.service';
import { VehicleService} from '../../../vehicle/services/vehicle.service';
import { LocationService} from '../../services/location.service';

import { Vehicle} from '../../model/vehicle.entity';
import { Publication} from '../../model/publication.entity';
import { Location} from '../../model/location.entity';
import { User} from '../../../iam/model/user.entity';
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
  vehicleTypes: string[] = ['SEDAN', 'SUV', 'HATCHBACK', 'COUPE', 'ELÉCTRICO', 'TRUCK', 'MOTOCICLETA'];
  fuelTypes: string[] = ['GASOLINA', 'DIESEL', 'ELÉCTRICO', 'HÍBRIDO'];
  isLoading: boolean = false;
  imagePreviewUrl: string = '';

  private formSubscription: Subscription = new Subscription();

  private testOwnerId: string = 'user002';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private publicacionService: PublicationService,
    private vehicleService: VehicleService,
    private locationService: LocationService,
    private dialog: MatDialog
  ) {
    this.publishForm = this.fb.group({
      vehicleSelectionMode: ['new', Validators.required],
      existingVehicleId: [{ value: '', disabled: true }],
      vehicleDetails: this.fb.group({
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
      }),
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
    this.vehicleService.getUnpublishedVehicles().subscribe({
      next: (data) => {
        this.unpublishedVehicles = data;
        if (this.unpublishedVehicles.length === 0) {
          this.publishForm.get('vehicleSelectionMode')?.setValue('new');
          this.publishForm.get('vehicleSelectionMode')?.disable();
        }
      },
      error: (err) => {
        console.error('Error al cargar vehículos no publicados:', err);
        this.snackBar.open('Error al cargar la lista de vehículos.', 'Cerrar', { panelClass: ['error-snackbar'] });
      }
    });

    this.locationService.getAllLocations().subscribe({
      next: (data) => {
        this.locations = data;
      },
      error: (err) => {
        console.error('Error al cargar ubicaciones:', err);
        this.snackBar.open('Error al cargar la lista de ubicaciones.', 'Cerrar', { panelClass: ['error-snackbar'] });
      }
    });

    this.formSubscription.add(this.publishForm.get('vehicleSelectionMode')?.valueChanges.subscribe(mode => {
      this.toggleVehicleDetailsFormGroup(mode === 'new');
    }));

    this.formSubscription.add(this.vehicleDetails.get('mainImageUrl')?.valueChanges.subscribe(url => {
      this.imagePreviewUrl = url;
    }));
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }

  get vehicleSelectionModeControl(): AbstractControl | null {
    return this.publishForm.get('vehicleSelectionMode');
  }

  get vehicleDetails(): FormGroup {
    return this.publishForm.get('vehicleDetails') as FormGroup;
  }

  get publicacionDetails(): FormGroup {
    return this.publishForm.get('publicacionDetails') as FormGroup;
  }

  private toggleVehicleDetailsFormGroup(enable: boolean): void {
    if (enable) {
      this.vehicleDetails.enable();
      this.publishForm.get('existingVehicleId')?.disable();
      this.publishForm.get('existingVehicleId')?.setValue('');
    } else {
      this.vehicleDetails.disable();
      this.publishForm.get('existingVehicleId')?.enable();
      this.vehicleDetails.reset();
      this.imagePreviewUrl = '';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.publishForm.invalid) {
      this.publishForm.markAllAsTouched();
      this.snackBar.open('Por favor, completa todos los campos requeridos correctamente.', 'Cerrar', { panelClass: ['error-snackbar'] });
      return;
    }

    this.isLoading = true;
    let vehicleToPublish: Vehicle;

    try {
      if (this.vehicleSelectionModeControl?.value === 'new') {
        const newVehicleData: Vehicle = {
          id: nanoid(),
          ownerId: this.testOwnerId,
          ...this.vehicleDetails.value,
          galleryImageUrls: this.vehicleDetails.get('galleryImageUrls')?.value?.split(',').map((url: string) => url.trim()).filter((url: string) => url !== '') || []
        };
        vehicleToPublish = (await this.vehicleService.createVehicle(newVehicleData).toPromise()) as Vehicle;
        this.snackBar.open('Vehículo creado exitosamente.', 'Cerrar', { panelClass: ['success-snackbar'], duration: 3000 });
      } else {
        const selectedVehicleId = this.publishForm.get('existingVehicleId')?.value;
        if (!selectedVehicleId) {
          throw new Error('Debes seleccionar un vehículo existente.');
        }
        const fetchedVehicle = await this.vehicleService.getVehicleById(selectedVehicleId).toPromise();
        if (fetchedVehicle) {
          vehicleToPublish = fetchedVehicle;
        } else {
          throw new Error('Vehículo existente no encontrado.');
        }
      }

      const selectedLocation = this.locations.find(loc => loc.id === this.publicacionDetails.get('pickupLocationId')?.value);
      if (!selectedLocation) {
        throw new Error('La ubicación de recogida seleccionada no es válida.');
      }

      const publicationDate = new Date().toISOString();

      const publicacionData: Publication = {
        id: nanoid(),
        ...this.publicacionDetails.value,
        vehicleId: vehicleToPublish.id,
        ownerId: this.testOwnerId,
        pickupLocationId: selectedLocation.id,
        status: 'ACTIVO',
        availabilitySlots: this.publicacionDetails.get('availabilitySlots')?.value || [],
        publicationDate: publicationDate,
        vehicle: undefined,
        owner: undefined,
        pickupLocation: undefined
      };

      await this.publicacionService.createPublication(publicacionData).toPromise();
      this.dialog.open(PublishDialogComponent, {
        data: { title: 'Publicación Exitosa', message: 'Tu vehículo ha sido publicado exitosamente.', isSuccess: true }
      });
      this.publishForm.reset();
      this.resetFormState();
      this.vehicleService.getUnpublishedVehicles().subscribe({
        next: (data) => {
          this.unpublishedVehicles = data;
          if (this.unpublishedVehicles.length === 0) {
            this.publishForm.get('vehicleSelectionMode')?.setValue('new');
            this.publishForm.get('vehicleSelectionMode')?.disable();
          } else {
            this.publishForm.get('vehicleSelectionMode')?.enable();
          }
        }
      });
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
      vehicleSelectionMode: 'new',
      vehicleDetails: {
        make: '', model: '', year: null, color: '', licensePlate: '',
        currentMileage: null, vehicleType: '', fuelType: '', passengerCapacity: null,
        description: '', mainImageUrl: '', galleryImageUrls: ''
      },
      publicacionDetails: {
        title: '', dailyPrice: null, weeklyPrice: null, minRentalDays: 1, maxRentalDays: 30,
        carRules: '', pickupLocationId: '', isFeatured: false
      }
    });
    this.toggleVehicleDetailsFormGroup(true);
    this.imagePreviewUrl = '';
    this.publishForm.get('vehicleSelectionMode')?.enable();
  }
  get selectedExistingVehicle(): Vehicle | undefined {
    const selectedId = this.publishForm.get('existingVehicleId')?.value;
    return this.unpublishedVehicles.find(v => v.id === selectedId);
  }
}
