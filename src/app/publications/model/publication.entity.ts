export class Publication {
  id: number;
  externalId: string;
  title: string;
  description: string;
  dailyPrice: number;
  weeklyPrice: number | null;
  vehicleId: number;
  ownerId: string;
  pickupLocationId: string;
  carRules: string;
  status: string;
  isFeatured: boolean;
  availableFrom: string;
  availableUntil: string;
  createdAt: string;
  updatedAt: string;
  vehicleMake: string;
  vehicleModel: string;
  mainImageUrl: string; // <-- Agrega esta línea
  ownerFullName: string;
  pickupLocationAddressSummary: string;

  constructor(
    id: number = 0,
    externalId: string = '',
    title: string = '',
    description: string = '',
    dailyPrice: number = 0,
    weeklyPrice: number | null = null,
    vehicleId: number = 0,
    ownerId: string = '',
    pickupLocationId: string = '',
    carRules: string = '',
    status: string = '',
    isFeatured: boolean = false,
    availableFrom: string = '',
    availableUntil: string = '',
    createdAt: string = '',
    updatedAt: string = '',
    vehicleMake: string = '',
    vehicleModel: string = '',
    mainImageUrl: string = '', // <-- Agrega este parámetro
    ownerFullName: string = '',
    pickupLocationAddressSummary: string = ''
  ) {
    this.id = id;
    this.externalId = externalId;
    this.title = title;
    this.description = description;
    this.dailyPrice = dailyPrice;
    this.weeklyPrice = weeklyPrice;
    this.vehicleId = vehicleId;
    this.ownerId = ownerId;
    this.pickupLocationId = pickupLocationId;
    this.carRules = carRules;
    this.status = status;
    this.isFeatured = isFeatured;
    this.availableFrom = availableFrom;
    this.availableUntil = availableUntil;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.vehicleMake = vehicleMake;
    this.vehicleModel = vehicleModel;
    this.mainImageUrl = mainImageUrl; // <-- Inicializa la propiedad
    this.ownerFullName = ownerFullName;
    this.pickupLocationAddressSummary = pickupLocationAddressSummary;
  }
}
