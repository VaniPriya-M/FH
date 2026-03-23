export interface UserCredentials {
  email: string;
  password: string;
}

export interface AppointmentSlot {
  service: string;
  date: string;
  timeSlotIndex?: number;
}

export interface PaymentDetails {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  zipCode: string;
}

export interface BookingConfirmation {
  confirmationNumber?: string;
  service: string;
  date: string;
  amount: string;
}

export interface TestConfig {
  baseUrl: string;
  defaultUser: UserCredentials;
  testPayment: PaymentDetails;
  timeouts: {
    navigation: number;
    action: number;
    assertion: number;
  };
}
