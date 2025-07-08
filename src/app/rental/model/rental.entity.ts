export class Rental {
  id: number; 
  publicationId: number; 
  renterId: string; 
  bookingDate: string; 
  startDate: string; 
  endDate: string; 
  totalCost: number; 
  baseCost: number; 
  insuranceCost: number; 
  platformCommission: number;
  pickupMileage: number;
  dropoffMileage: number | null; 
  status: string;
  insuranceId: number; 
  pickupLocationId: string; 
  dropoffLocationId: string; 

  constructor(
    id: number = 0,
    publicationId: number = 0,
    renterId: string = '',
    bookingDate: string = '',
    startDate: string = '',
    endDate: string = '',
    totalCost: number = 0,
    baseCost: number = 0,
    insuranceCost: number = 0,
    platformCommission: number = 0,
    pickupMileage: number = 0,
    dropoffMileage: number | null = null,
    status: string = '',
    insuranceId: number = 0,
    pickupLocationId: string = '',
    dropoffLocationId: string = ''
  ) {
    this.id = id;
    this.publicationId = publicationId;
    this.renterId = renterId;
    this.bookingDate = bookingDate;
    this.startDate = startDate;
    this.endDate = endDate;
    this.totalCost = totalCost;
    this.baseCost = baseCost;
    this.insuranceCost = insuranceCost;
    this.platformCommission = platformCommission;
    this.pickupMileage = pickupMileage;
    this.dropoffMileage = dropoffMileage;
    this.status = status;
    this.insuranceId = insuranceId;
    this.pickupLocationId = pickupLocationId;
    this.dropoffLocationId = dropoffLocationId;
  }
}
