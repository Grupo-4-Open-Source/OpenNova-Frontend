export class Vehicle {
  id: number; 
  ownerId: string;
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
  galleryImageUrls: string[];

  constructor(
    id: number = 0, 
    ownerId: string = '',
    make: string = '',
    model: string = '',
    year: number = 0,
    color: string = '',
    licensePlate: string = '',
    currentMileage: number = 0,
    vehicleType: string = '',
    fuelType: string = '',
    passengerCapacity: number = 0,
    description: string = '',
    mainImageUrl: string = '',
    galleryImageUrls: string[] = []
  ) {
    this.id = id;
    this.ownerId = ownerId;
    this.make = make;
    this.model = model;
    this.year = year;
    this.color = color;
    this.licensePlate = licensePlate;
    this.currentMileage = currentMileage;
    this.vehicleType = vehicleType;
    this.fuelType = fuelType;
    this.passengerCapacity = passengerCapacity;
    this.description = description;
    this.mainImageUrl = mainImageUrl;
    this.galleryImageUrls = galleryImageUrls;
  }
}
