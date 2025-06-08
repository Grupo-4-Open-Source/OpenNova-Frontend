import { Publication} from '../../publications/model/publication.entity';
import { User} from '../../iam/model/user.entity';
import { Insurance} from './insurance.entity';
import { Location} from '../../publications/model/location.entity';

export class Rental {
  id: string;
  publicacionId: string;
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
  insuranceId: string;
  pickupLocationId: string;
  dropoffLocationId: string;

  publication?: Publication;
  renter?: User;
  insurance?: Insurance;
  pickupLocation?: Location;
  dropoffLocation?: Location;

  constructor() {
    this.id = '';
    this.publicacionId = '';
    this.renterId = '';
    this.bookingDate = '';
    this.startDate = '';
    this.endDate = '';
    this.totalCost = 0;
    this.baseCost = 0;
    this.insuranceCost = 0;
    this.platformCommission = 0;
    this.pickupMileage = 0;
    this.dropoffMileage = null;
    this.status = '';
    this.insuranceId = '';
    this.pickupLocationId = '';
    this.dropoffLocationId = '';
  }
}
