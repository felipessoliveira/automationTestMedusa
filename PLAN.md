# Medusa Storefront Test Automation — Initial Setup Plan

> **Status as of this update.** Framework scaffold is complete and running. Test run shows **1 of 4 scenarios green** against the live demo storefront; the remaining 3 are blocked on environmental configuration described below. See the [Status](#status--what-is-done-vs-what-is-left) section for the punch list.

## Status — what is done vs what is left

### ✅ Done (framework)

| Area | Status | Notes |
|---|---|---|
| Project scaffold | ✅ | `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`, `README.md` |
| Cucumber + Playwright wiring | ✅ | `cucumber.js` profiles (`default` / `api` / `ui`), `playwright.config.ts`, support layer (`world.ts`, `hooks.ts`, `config.ts`, `allure.ts`) |
| Test-data fixtures | ✅ | `fixtures/users/default.json`, `fixtures/users/login.json`, `fixtures/products/default.json` + `src/utils/fixtures.ts` (`loadFixture` / `mergeFixture` / `buildFixture`) + `src/utils/data.ts` (token expansion: `<timestamp>`, `<uuid>`, etc.) |
| Page Objects | ✅ | `BasePage`, `HomePage`, `AccountPage`, `ProductPage`, `CartPage`. Selectors moved to the storefront's `data-testid` attributes (`email-input`, `password-input`, `first-name-input`, `register-button`, `option-button`, `add-product-button`) after live DOM probe. |
| API client | ✅ | `src/api/clients/customerClient.ts` + typed models in `src/api/models/customer.ts` |
| Features + step defs | ✅ | 4 `.feature` files, 5 step-def modules. `Scenario Outline` + `Examples:` overrides merged over JSON fixture templates. |
| Parallel execution | ✅ | `npm run test`, `test:api`, `test:ui` all run with `--parallel 4`. Serial escape-hatch: `npm run test:serial`. |
| Allure reporting | ✅ | Wired via `--format allure-cucumberjs/reporter`. Screenshot + HTML attached on UI failure; API request/response JSON attached on API scenarios. |
| Dependency install | ✅ | `npm install` + `npx playwright install chromium` done. |
| Backend discovery probe | ✅ | `scripts/discover_backend.ts` runs; confirmed that the live storefront hides the Medusa backend behind Next.js Server Actions (no `/store/*` client calls, no `x-publishable-api-key` in the browser). Decision: point `.env` at a separate accessible Medusa backend. |

### ✅ Last live run

```
5 scenarios executed (parallel)
  ✅  UI   — Create user (storefront sign-up form)
  ❌  API  — Create user            (blocked on .env — see Remaining #1)
  ❌  UI   — Login                  (blocked on seeded user — see Remaining #2)
  ❌  UI   — Add to cart  (× 2)     (blocked on inventory — see Remaining #3)
```

Selector bugs found and fixed during that run (already committed to the POMs):
- `AccountPage` now uses the hydrated `data-testid` nodes and waits for the register form to mount after clicking `[data-testid="register-button"]`.
- `ProductPage.variantOptions` narrowed to `button[data-testid="option-button"]` — was previously matching the `/store` page's sort dropdown.
- `AccountPage.expectLoggedIn` now asserts `emailInput` becomes hidden — eliminated the false-positive "login passed" when login actually failed.

### 🟡 Remaining

| # | Task | Owner | Unblocks |
|---|---|---|---|
| 1 | Create local `.env` from `.env.example` (values already pasted into the example file: `MEDUSA_API_URL=https://medusa-backend-839705751382.europe-west1.run.app`, `MEDUSA_PUBLISHABLE_KEY=pk_5baf...`) | user (or Claude, on request) | `@api` create user |
| 2 | Run `scripts/seed_shared_user.ts` (to be written in Phase B) to register the shared login user via the Store API using `fixtures/users/login.json`. Idempotent — ignores 409/422 "already exists". | Claude (Phase B) | `@ui` login |
| 3 | Phase C (tag-and-guard): add `@requires-stock` to `features/ui/add_product_to_cart.feature`, add `ui:stock` profile to `cucumber.js`, README note. The live demo has no inventory — scenarios are kept green by excluding them from default runs and exposing an opt-in profile for when stock is available. | Claude (Phase C) | Default `npm run test:ui` becomes green; cart scenarios runnable on demand via `npm run test:ui:stock`. |
| 4 | `npm run test:api` to confirm `@api` green once `.env` is in place. | Claude | — |
| 5 | `npm run test:ui` to confirm all 3 UI scenarios green (2 default + cart opt-in). | Claude | — |
| 6 | Generate Allure report: `npm run report:gen && npm run report:open`. | Claude | Final deliverable |

### Immediate next step

Copy `.env.example` → `.env` (the values are already filled in the example), then implement Phase B (seed-shared-user script) and Phase C (cart tag/profile guard). `@api` should pass the moment `.env` exists; `@ui` login should pass after seeding; `@ui` add-to-cart will be excluded from the default profile with a clear "requires stocked backend" note.

---

## Context

`/Users/felipeoliveira/automationTestMedusa/` is an empty directory that will become a Playwright-based automation test framework targeting the Medusa storefront at
`https://medusa-storefront-839705751382.europe-west1.run.app/es/store`.

The goal of this first pass is to scaffold the project and land three working scenarios that exercise both the API and UI layers:

1. **Create user — API** (Medusa Store API)
2. **Create user — UI** (storefront registration form)
3. **Login — UI**
4. **Add product to cart — UI**

Stack choices (confirmed with user):

- **Language:** TypeScript
- **Runner / assertions:** Playwright (`@playwright/test` for browsers + `APIRequestContext`)
- **BDD:** `@cucumber/cucumber`
- **Pattern:** Page Object Model
- **Test data:** fixed / shared test user loaded from `.env`
- **Reporting:** Cucumber + Allure (`allure-cucumberjs` + `allure-commandline`)

---

## Project structure

```
automationTestMedusa/
├── package.json
├── tsconfig.json
├── cucumber.js                       # profiles: default, api, ui
├── playwright.config.ts              # browser + baseURL defaults (shared helpers)
├── .env.example
├── .gitignore
├── README.md
├── reports/                          # allure-results + allure-report (gitignored)
├── features/
│   ├── api/
│   │   └── create_user.feature       # @api @user
│   └── ui/
│       ├── create_user.feature       # @ui @user
│       ├── login.feature             # @ui @auth
│       └── add_product_to_cart.feature   # @ui @cart
├── fixtures/                         # JSON templates — scenarios override selected fields
│   ├── users/
│   │   ├── default.json              # baseline customer payload (all required fields)
│   │   └── login.json                # shared login user defaults
│   └── products/
│       └── default.json              # baseline product / cart-line payload
└── src/
    ├── support/
    │   ├── world.ts                  # CustomWorld: browser, context, page, api, testData
    │   ├── hooks.ts                  # Before/After (tag-scoped) + Allure attachments
    │   ├── config.ts                 # reads .env, exposes typed Config object
    │   └── allure.ts                 # registers AllureCucumber reporter
    ├── api/
    │   ├── clients/
    │   │   └── customerClient.ts     # POST /store/customers, POST /store/auth/customer
    │   └── models/
    │       └── customer.ts           # Customer / RegisterPayload types
    ├── pages/
    │   ├── BasePage.ts               # goto(path), waitForLoad(), locale-aware URL builder
    │   ├── HomePage.ts               # /{locale}/store — openFirstProduct()
    │   ├── AccountPage.ts            # /{locale}/account — register(), login(), expectLoggedIn()
    │   ├── ProductPage.ts            # /{locale}/products/[handle] — addToCart()
    │   └── CartPage.ts               # /{locale}/cart — expectItem(name, qty)
    ├── steps/
    │   ├── common.steps.ts           # Given "I am on the storefront"
    │   ├── user.api.steps.ts         # loadFixture('users') + mergeFixture(row)
    │   ├── user.ui.steps.ts          # same merge pattern, drives AccountPage
    │   ├── login.steps.ts            # loadFixture('users', 'login') + mergeFixture(row)
    │   └── cart.steps.ts             # loadFixture('products') + mergeFixture(row)
    └── utils/
        ├── data.ts                   # uniqueEmail(), faker wrappers
        └── fixtures.ts               # loadFixture(type, name) + mergeFixture(base, overrides)
```

---

## Dependencies (`package.json`)

Runtime / dev:

- `@playwright/test`
- `@cucumber/cucumber`
- `typescript`, `ts-node`, `@types/node`
- `allure-cucumberjs`, `allure-commandline`
- `dotenv`
- `cross-env`
- `@faker-js/faker` (unique emails / names)

Scripts:

```jsonc
{
  "test":          "cucumber-js",
  "test:api":      "cucumber-js -p api",
  "test:ui":       "cucumber-js -p ui",
  "report:clean":  "rimraf reports/allure-report",
  "report:gen":    "allure generate reports/allure-results --clean -o reports/allure-report",
  "report:open":   "allure open reports/allure-report",
  "pw:install":    "playwright install chromium"
}
```

`cucumber.js` profiles:

```js
const common = [
  'features/**/*.feature',
  '--require-module ts-node/register',
  '--require src/support/**/*.ts',
  '--require src/steps/**/*.ts',
  '--format allure-cucumberjs/reporter',
  '--format summary',
  '--publish-quiet',
].join(' ');

module.exports = {
  default: common,
  api:     `${common} --tags @api`,
  ui:      `${common} --tags @ui`,
};
```

---

## Test data fixtures

All required fields live in versioned JSON templates under `fixtures/`. In a scenario, only the fields that differ per example are named in the `Examples:` table; every other field is inherited from the template via `mergeFixture`.

### `fixtures/users/default.json`

```json
{
  "email": "qa.user@example.com",
  "password": "ChangeMe!123",
  "first_name": "QA",
  "last_name": "Tester",
  "phone": "+34600000000"
}
```

### `fixtures/users/login.json`

```json
{
  "email": "qa.shared.user@example.com",
  "password": "ChangeMe!123"
}
```

### `fixtures/products/default.json`

```json
{
  "name": "Medusa T-Shirt",
  "variant": "M / Black",
  "quantity": 1
}
```

### Merge helper — `src/utils/fixtures.ts`

```ts
import fs from 'node:fs';
import path from 'node:path';

export type FixtureKind = 'users' | 'products';

export function loadFixture<T = Record<string, unknown>>(kind: FixtureKind, name = 'default'): T {
  const file = path.join(process.cwd(), 'fixtures', kind, `${name}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
}

// shallow-merges overrides (e.g. a DataTable row) on top of the template
export function mergeFixture<T extends object>(base: T, overrides: Partial<T> = {}): T {
  const cleaned = Object.fromEntries(
    Object.entries(overrides).filter(([, v]) => v !== undefined && v !== ''),
  );
  return { ...base, ...cleaned } as T;
}
```

Step definitions call `mergeFixture(loadFixture('users'), row)` so only the columns present in the feature's `Examples:` override the template; everything else falls through from the JSON.

---

## Feature files

### `features/api/create_user.feature`

```gherkin
@api @user
Feature: Create user via Medusa Store API

  Scenario Outline: Register a new customer through the Store API
    Given a customer payload based on the "default" user template with:
      | email   | <email>   |
    When I POST it to the Medusa store customers endpoint
    Then the response status is 200
    And the response body contains the customer id and email

    Examples:
      | email                          |
      | qa.api.<timestamp>@example.com |
```

### `features/ui/create_user.feature`

```gherkin
@ui @user
Feature: Create user via storefront UI

  Scenario Outline: Register a new customer through the sign-up form
    Given I am on the account page
    When I submit the registration form using the "default" user template with:
      | email      | <email>      |
      | first_name | <first_name> |
    Then I see the authenticated account dashboard

    Examples:
      | email                         | first_name |
      | qa.ui.<timestamp>@example.com | Felipe     |
```

### `features/ui/login.feature`

```gherkin
@ui @auth
Feature: Login via storefront UI

  Scenario Outline: Existing customer signs in
    Given I am on the account page
    When I sign in using the "login" user template with:
      | email | <email> |
    Then I see the authenticated account dashboard

    Examples:
      | email                      |
      | qa.shared.user@example.com |
```

Only the `email` column is overridden per example — the `password` comes from `fixtures/users/login.json`, exactly the pattern you asked for.

### `features/ui/add_product_to_cart.feature`

```gherkin
@ui @cart
Feature: Add product to cart

  Scenario Outline: Add a product to the cart
    Given I am on the storefront
    When I add a product to the cart using the "default" product template with:
      | name | <name> |
    Then the cart page shows that product with the template quantity

    Examples:
      | name             |
      | Medusa T-Shirt   |
      | Medusa Sweatshirt |
```

Only `name` is overridden — `variant` and `quantity` come from `fixtures/products/default.json`.

> Note on `<timestamp>`: the step uses `uniqueEmail(base)` from `src/utils/data.ts` when it detects the `<timestamp>` token, producing e.g. `qa.api.1714052400000@example.com`. Keeps scenarios idempotent without leaking dates into the feature file.

---

## Page Objects (key responsibilities)

- **`BasePage`** — constructor `(page: Page, config: Config)`; helpers `goto(path)`, `url(path)` that prepend `/{locale}` (e.g. `/es`).
- **`HomePage`** — path `/store`; `openFirstProduct()` clicks first product card.
- **`AccountPage`** — path `/account`; `register({ email, password, first, last })`, `login(email, password)`, `expectLoggedIn()`. Selectors favor `getByRole('textbox', { name: ... })` / `getByLabel`.
- **`ProductPage`** — path `/products/[handle]`; `selectFirstAvailableVariant()` + `addToCart()`.
- **`CartPage`** — path `/cart`; `getLineItems()`, `expectItem(name, qty)`.

Selectors will be finalized during implementation via `npx playwright codegen <BASE_URL>/es/store`.

---

## API layer

- `customerClient.ts` builds on Playwright's `APIRequestContext`:
  - `createCustomer(payload)` → `POST {MEDUSA_API_URL}/store/customers` with headers `x-publishable-api-key` + `Content-Type: application/json`.
  - Returns typed `Customer`.
- Medusa backend URL + publishable key are **TBD**; surfaced during the first implementation pass (devtools network tab on the live storefront), placed in `.env.example` with dummy values, real values in local `.env`.

---

## Support / hooks

`world.ts`:

```ts
export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  api!: APIRequestContext;
  testData: Record<string, unknown> = {};
}
setWorldConstructor(CustomWorld);
```

`hooks.ts`:

- `BeforeAll` — launch chromium once (headless by default, `HEADED=1` opts in).
- `Before({ tags: '@ui' })` — new `BrowserContext` + `Page` per scenario.
- `Before({ tags: '@api' })` — new `APIRequestContext` bound to `MEDUSA_API_URL`.
- `After` — on failure: screenshot + page HTML, attach to Allure; on all: close scenario context.
- `AfterAll` — close browser.

---

## Configuration

`.env.example`:

```bash
BASE_URL=https://medusa-storefront-839705751382.europe-west1.run.app
LOCALE=es
MEDUSA_API_URL=<tbd-during-impl>
MEDUSA_PUBLISHABLE_KEY=<tbd-during-impl>
TEST_USER_EMAIL=qa.shared.user@example.com
TEST_USER_PASSWORD=ChangeMe!123
HEADED=0
```

`.gitignore`: `node_modules/`, `reports/`, `.env`, `playwright-report/`, `test-results/`.

Shared test user is **pre-seeded** on the target environment (either manually, or by running the `@api` create-user scenario once with stable credentials and then reusing them via `.env`).

---

## Verification

1. `npm install`
2. `npm run pw:install`
3. `cp .env.example .env` and populate `MEDUSA_API_URL`, `MEDUSA_PUBLISHABLE_KEY`, `TEST_USER_*`.
4. Seed shared test user (once): `npm run test:api` then manually copy the created email/password into `.env`, **or** register via the storefront once.
5. `npm run test:api` → passing `@api` scenario.
6. `npm run test:ui` → passing `@ui` scenarios (create user, login, add to cart).
7. `npm run report:gen && npm run report:open` → Allure report renders all scenarios with steps, screenshots on failure, and API request/response attachments.

---

## Open items resolved during implementation (not blockers)

- Exact Medusa backend URL + `x-publishable-api-key` (inspect storefront network calls).
- Final locators for register / login / add-to-cart (run `playwright codegen` against live URL).
- Whether the storefront requires a region/country selection flow before `/cart` works — add a setup step in `BasePage` if so.
