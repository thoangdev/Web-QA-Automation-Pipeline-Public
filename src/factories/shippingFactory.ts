import type { Shipping } from '../utils/testData';
import { random } from '../utils/random';

const FIRST_NAMES = ['Alex', 'Sam', 'Jordan', 'Casey', 'Morgan', 'Riley'];
const LAST_NAMES = ['Lee', 'Park', 'Singh', 'Patel', 'Nguyen', 'Kim'];

export const shippingFactory = {
  build(overrides: Partial<Shipping> = {}): Shipping {
    return {
      firstName: FIRST_NAMES[random.number(0, FIRST_NAMES.length - 1)]!,
      lastName: LAST_NAMES[random.number(0, LAST_NAMES.length - 1)]!,
      postalCode: random.postalCode(),
      ...overrides,
    };
  },

  invalid: {
    missingFirstName(): Partial<Shipping> {
      return { firstName: '', lastName: 'Tester', postalCode: '94016' };
    },
    missingPostalCode(): Partial<Shipping> {
      return { firstName: 'Alex', lastName: 'Tester', postalCode: '' };
    },
  },
};
