import { TestConfig } from '../types';

export const config: TestConfig = {
  baseUrl: process.env.BASE_URL || 'https://myezra-staging.ezra.com',

  defaultUser: {
    email: process.env.TEST_USER_EMAIL || '',
    password: process.env.TEST_USER_PASSWORD || '',
  },

  testPayment: {
    cardholderName: process.env.TEST_CARD_NAME || 'Test User',
    cardNumber: process.env.TEST_CARD_NUMBER || '4242424242424242',
    expiry: process.env.TEST_CARD_EXPIRY || '1228',
    cvv: process.env.TEST_CARD_CVV || '123',
  },

  timeouts: {
    navigation: 60_000,
    action: 30_000,
    assertion: 15_000,
  },
};
