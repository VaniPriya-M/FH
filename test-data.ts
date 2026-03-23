import { UserCredentials, PaymentDetails } from '../types';

export class TestData {
  static readonly validUser: UserCredentials = {
    email: process.env.TEST_USER_EMAIL || '',
    password: process.env.TEST_USER_PASSWORD || '',
  };

  static readonly invalidUser: UserCredentials = {
    email: 'invalid@example.com',
    password: 'WrongPassword!',
  };

  static readonly validCard: PaymentDetails = {
    cardholderName: process.env.TEST_CARD_NAME || 'Test User',
    cardNumber: process.env.TEST_CARD_NUMBER || '4242424242424242',
    expiry: process.env.TEST_CARD_EXPIRY || '1228',
    cvv: process.env.TEST_CARD_CVV || '123',
    zipCode: process.env.TEST_CARD_ZIP || '10001',
  };

  static readonly declinedCard: PaymentDetails = {
    cardholderName: 'Declined User',
    cardNumber: '4000000000000002',
    expiry: '1228',
    cvv: '123',
    zipCode: '10001',
  };

  static readonly insufficientFundsCard: PaymentDetails = {
    cardholderName: 'Broke User',
    cardNumber: '4000000000009995',
    expiry: '1228',
    cvv: '123',
    zipCode: '10001',
  };
}
