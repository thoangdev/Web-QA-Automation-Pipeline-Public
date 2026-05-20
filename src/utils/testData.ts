import usersJson from '../../test-data/users.json';
import productsJson from '../../test-data/products.json';

export type UserKey = keyof typeof usersJson.users;

export interface TestUser {
  username: string;
  password: string;
  description: string;
}

export interface Product {
  name: string;
  price: number;
}

export interface Shipping {
  firstName: string;
  lastName: string;
  postalCode: string;
}

function readPassword(): string {
  const password = process.env.TEST_USER_PASSWORD;
  if (!password) {
    throw new Error(
      'TEST_USER_PASSWORD is not set. Copy .env.example to .env.local and fill it in.',
    );
  }
  return password;
}

export function getUser(key: UserKey): TestUser {
  const entry = usersJson.users[key];
  return { ...entry, password: readPassword() };
}

export function getProducts(): Product[] {
  return productsJson.products;
}

export function getProduct(name: string): Product {
  const found = getProducts().find(p => p.name === name);
  if (!found) {
    throw new Error(`Unknown product "${name}" — check test-data/products.json`);
  }
  return found;
}

export function getDefaultShipping(): Shipping {
  return productsJson.shipping.default;
}
