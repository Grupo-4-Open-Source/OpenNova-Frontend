export class Vehicle {
  id: number;
  model: string;
  brand: string;
  year: number;
  description: string;
  image: string;
  price: number

  constructor() {
    this.id = 0;
    this.model = '';
    this.brand = '';
    this.year = 0;
    this.description = '';
    this.image = '';
    this.price = 0;
  }
}
