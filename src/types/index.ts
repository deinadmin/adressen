export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  country: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface InvitationCode {
  id?: string;
  code: string;
  isValid: boolean;
  description?: string;
}
