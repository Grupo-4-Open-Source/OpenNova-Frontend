export class AvailabilitySlot {
  public startDate: string;
  public endDate: string;
  public isBooked: boolean;

  constructor() {
    this.startDate = '';
    this.endDate = '';
    this.isBooked = false;
  }
}
