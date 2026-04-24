import { faker } from '@faker-js/faker';

export function uniqueEmail(prefix = 'qa'): string {
  return `${prefix}.${Date.now()}@example.com`;
}

export function uniquePassword(): string {
  return `Pw!${faker.string.alphanumeric(10)}`;
}

export function randomName(): { first: string; last: string } {
  return {
    first: faker.person.firstName(),
    last: faker.person.lastName(),
  };
}

// Replaces tokens inside a string with generated values.
// Supported: <timestamp>, <uuid>, <email>, <first_name>, <last_name>.
// Unknown tokens are left untouched so `<variant>` etc. pass through.
export function expandTokens(input: string): string {
  return input
    .replace(/<timestamp>/g, String(Date.now()))
    .replace(/<uuid>/g, faker.string.uuid())
    .replace(/<email>/g, uniqueEmail())
    .replace(/<first_name>/g, faker.person.firstName())
    .replace(/<last_name>/g, faker.person.lastName());
}
