import fs from 'node:fs';
import path from 'node:path';
import { expandTokens } from './data';

export type FixtureKind = 'users' | 'products';

function fixturePath(kind: FixtureKind, name: string): string {
  return path.join(process.cwd(), 'fixtures', kind, `${name}.json`);
}

export function loadFixture<T extends object = Record<string, unknown>>(
  kind: FixtureKind,
  name = 'default',
): T {
  const file = fixturePath(kind, name);
  if (!fs.existsSync(file)) {
    throw new Error(`Fixture not found: ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
}

// Shallow-merges `overrides` onto `base`. Empty / undefined overrides are
// dropped so a Cucumber DataTable column with no value inherits from the
// template. String values containing tokens like `<timestamp>` are expanded.
export function mergeFixture<T extends object>(
  base: T,
  overrides: Record<string, unknown> = {},
): T {
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined || v === '') continue;
    cleaned[k] = typeof v === 'string' ? expandTokens(v) : v;
  }
  return { ...base, ...cleaned } as T;
}

// Convenience: load + merge in one call.
export function buildFixture<T extends object = Record<string, unknown>>(
  kind: FixtureKind,
  overrides: Record<string, unknown> = {},
  name = 'default',
): T {
  return mergeFixture(loadFixture<T>(kind, name), overrides);
}
