import { z } from 'zod';
import usersJson from '../../test-data/users.json';
import productsJson from '../../test-data/products.json';

const UserEntrySchema = z.object({
  username: z.string().min(1),
  description: z.string().min(1),
});

const UsersFileSchema = z.object({
  users: z.object({
    standard: UserEntrySchema,
    lockedOut: UserEntrySchema,
    problem: UserEntrySchema,
    performanceGlitch: UserEntrySchema,
    error: UserEntrySchema,
    visual: UserEntrySchema,
  }),
});

const ProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

const ProductsFileSchema = z.object({
  products: z.array(ProductSchema).min(1),
  shipping: z.object({
    default: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      postalCode: z.string().min(1),
    }),
  }),
});

// Parse-at-load — invalid data fails immediately, not in some random test.
const usersFile = UsersFileSchema.parse(usersJson);
const productsFile = ProductsFileSchema.parse(productsJson);

export type UserKey = keyof typeof usersFile.users;

export interface TestUser {
  username: string;
  password: string;
  description: string;
}

export type Product = z.infer<typeof ProductSchema>;
export type Shipping = z.infer<typeof ProductsFileSchema>['shipping']['default'];

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
  return { ...usersFile.users[key], password: readPassword() };
}

export function getProducts(): Product[] {
  return productsFile.products;
}

export function getProduct(name: string): Product {
  const found = productsFile.products.find(p => p.name === name);
  if (!found) {
    throw new Error(`Unknown product "${name}" — check test-data/products.json`);
  }
  return found;
}

export function getDefaultShipping(): Shipping {
  return productsFile.shipping.default;
}
