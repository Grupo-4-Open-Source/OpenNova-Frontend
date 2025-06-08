export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  birthday: Date;
  profilePicUrl?: string;
}

export interface Renter extends User {
  licenseNumber: string;
  licenseExpirationDate: Date;
  paymentMethodToken?: string;
}

export interface Owner extends User {
  bankAccountNumber: string;
  taxId: string;
}
