import { Component } from '@angular/core';
import { EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Vehicle } from "../../model/vehicle.entity";
import { FormsModule, NgForm } from "@angular/forms";
import { MatFormField } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-vehicle-create-and-edit',
  imports: [MatFormField, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './vehicle-create-and-edit.component.html',
  styleUrl: './vehicle-create-and-edit.component.css'
})
export class VehicleCreateAndEditComponent {
  // Attributes
  @Input() vehicle: Vehicle;
  @Input() editMode: boolean = false;
  @Output() vehicleAdded: EventEmitter<Vehicle> = new EventEmitter<Vehicle>();
  @Output() vehicleUpdated: EventEmitter<Vehicle> = new EventEmitter<Vehicle>();
  @Output() editCanceled: EventEmitter<any> = new EventEmitter();
  @ViewChild('vehicleForm', {static: false}) vehicleForm!: NgForm;

  // Methods
  constructor() {
    this.vehicle = {} as Vehicle;
  }

  // Private methods
  private resetEditState(): void {
    this.vehicle = {} as Vehicle;
    this.editMode = false;
    this.vehicleForm.resetForm();
  }

  // Event Handlers
  onSubmit(): void {
    if (this.vehicleForm.form.valid) {
       if (!this.validateImageUrl(this.vehicle.image)) {
            console.error('La URL de la imagen no es válida');
            return;  // No seguir si la URL no es válida
          }

      let emitter: EventEmitter<Vehicle> = this.editMode ? this.vehicleUpdated : this.vehicleAdded;
      emitter.emit(this.vehicle);
      this.resetEditState();
    } else {
      console.error('Invalid data in form');
    }
  }

  onCancel(): void {
    this.editCanceled.emit();
    this.resetEditState();
  }

imagePreview: string | ArrayBuffer | null = null;
selectedFile: File | null = null;

onImageSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }
}


validateImageUrl(url: string): boolean {
  const regex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;
  return regex.test(url);
}



}
