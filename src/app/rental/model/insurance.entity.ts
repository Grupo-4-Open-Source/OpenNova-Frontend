export class Insurance {
  id: string;
  planName: string;
  description: string;
  dailyCost: number;
  deductible: number;
  coverageDetails: string;

  constructor() {
    this.id = '';
    this.planName = '';
    this.description = '';
    this.dailyCost = 0;
    this.deductible = 0;
    this.coverageDetails = '';
  }
}
