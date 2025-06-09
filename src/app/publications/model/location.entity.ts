export class Location {
  id: string;
  addressLine1: string;
  city: string;
  stateProvince: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  instructions: string
  constructor() {
    this.id = '';
    this.addressLine1 = '';
    this.city = '';
    this.stateProvince = '';
    this.zipCode = '';
    this.latitude = 0;
    this.longitude = 0;
    this.instructions = '';
  }

}
