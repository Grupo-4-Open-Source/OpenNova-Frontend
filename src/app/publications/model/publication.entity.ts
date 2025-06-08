import { Vehicle} from './vehicle.entity';
import { Location } from './location.entity';
import { AvailabilitySlot} from './availability-slot.entity';
import { User} from '../../iam/model/user.entity';

export class Publication {
  id: string;
  title: string;
  dailyPrice: number;
  weeklyPrice: number | null;
  minRentalDays: number;
  maxRentalDays: number;
  carRules: string;
  status: string;

  vehicleId: string;
  ownerId: string;
  pickupLocationId: string;
  isFeatured: boolean;
  publicationDate: string;

  vehicle?: Vehicle;
  owner?: User;
  pickupLocation?: Location;
  availabilitySlots?: AvailabilitySlot[];

  constructor() {
    this.id = '';
    this.title = '';
    this.dailyPrice = 0;
    this.weeklyPrice = null;
    this.minRentalDays = 0;
    this.maxRentalDays = 0;
    this.carRules = '';
    this.status = '';
    this.vehicleId = '';
    this.ownerId = '';
    this.pickupLocationId = '';
    this.isFeatured = false;
    this.publicationDate= '';
    this.availabilitySlots = [];
  }
}
