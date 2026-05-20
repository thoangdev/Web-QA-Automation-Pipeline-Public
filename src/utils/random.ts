import * as crypto from 'crypto';

const token = () => crypto.randomBytes(4).toString('hex');

export const random = {
  string: (prefix = 'test') => `${prefix}-${Date.now()}-${token()}`,
  email: (domain = 'example.com') => `qa-${Date.now()}-${token()}@${domain}`,
  number: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
  postalCode: () => String(10000 + Math.floor(Math.random() * 89999)),
};
