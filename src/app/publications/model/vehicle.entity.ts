export class Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  currentMileage: number;
  vehicleType: string;
  fuelType: string;
  passengerCapacity: number;
  description: string;
  mainImageUrl: string;
  galleryImageUrls: string[]

  constructor() {
    this.id = '';
    this.make = '';
    this.model = '';
    this.year = 0;
    this.color = '';
    this.licensePlate = '';
    this.currentMileage = 0;
    this.vehicleType = '';
    this.fuelType = '';
    this.passengerCapacity = 0;
    this.description = '';
    this.mainImageUrl = '';
    this.galleryImageUrls = [];
  }
}
