# automationTestMedusa

Playwright + Cucumber (TypeScript, Page Object Model) automation tests for the Medusa storefront at
`https://medusa-storefront-839705751382.europe-west1.run.app/es/store`.

## Setup

```bash
npm install
npm run pw:install                 # downloads Chromium
cp .env.example .env               # values for the demo backend are pre-filled
npx ts-node scripts/seed_shared_user.ts   # one-off: creates the shared login user (idempotent)
```

### Environment variables (`.env`)

| Var | Purpose |
|---|---|
| `BASE_URL` | Storefront origin (UI tests). |
| `LOCALE` | Storefront locale prefix (`es`, `en`, …). |
| `MEDUSA_API_URL` | Medusa v2 backend origin (API tests + seed script). |
| `MEDUSA_PUBLISHABLE_KEY` | `pk_...` store-side publishable API key. |
| `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | Credentials for the shared login user (seeded via the script above). |
| `HEADED` | `1` to run UI scenarios with a visible browser. |
| `SLOWMO`, `RECORD_VIDEO` | Optional debug aids. |

## Run

```bash
npm run test         # all scenarios (parallel 4)
npm run test:api     # @api only
npm run test:ui      # @ui only  (excludes @requires-stock)
npm run test:ui:stock   # cart scenarios — only green when the backend has inventory
npm run test:serial  # single-worker escape hatch for debugging
```

Tag filters can be layered, e.g. `npx cucumber-js -p ui --tags "@auth"`.

## Reports

```bash
npm run report:gen    # builds reports/allure-report from reports/allure-results
npm run report:open   # opens the report in a browser
```

On failure each UI scenario attaches a full-page screenshot + rendered HTML and writes a Playwright trace zip under `reports/traces/`; each API scenario attaches the request payload + response body + status. In GitHub Actions, failed UI traces are uploaded as the `playwright-traces-ui` artifact.

## Layout

```
features/            # Gherkin features (api/, ui/)
fixtures/            # JSON templates — scenarios override selected fields
  users/{default,login}.json
  products/default.json
scripts/             # One-off tooling (seed_shared_user.ts, discover_backend.ts, live-DOM probes)
src/
  api/clients/customerClient.ts   # Medusa v2 register/login flows
  api/models/                     # Typed DTOs
  pages/                          # Page Objects — stable data-testid selectors
  steps/                          # Cucumber step definitions
  support/                        # World, hooks, config, Allure wiring
  utils/                          # loadFixture, mergeFixture, token expansion, faker helpers
cucumber.js          # Profiles: default, api, ui, ui:stock
playwright.config.ts # Shared browser launch + context options (consumed by hooks)
PLAN.md              # Full status + outstanding work
AGENTS.md            # Contributor guide for repository conventions
```

## Test-data pattern

Feature files use `Scenario Outline` + `Examples:` and list **only** the fields that change per example. Everything else — required fields, defaults — comes from the matching JSON template in `fixtures/`:

```gherkin
When I sign in using the "login" user template with:
  | email | <email> |
Examples:
  | email                      |
  | qa.shared.user@example.com |
```

`fixtures/users/login.json` supplies the `password`. The merge happens in `src/utils/fixtures.ts` (`buildFixture`).

## Notes on the target environment

- The Medusa storefront at `…run.app` proxies all `/store/*` calls through Next.js Server Actions; the publishable key and backend URL are not visible to the browser. `@api` tests point at the Medusa backend directly (see `MEDUSA_API_URL`).
- The cart scenarios are tagged `@requires-stock` and excluded from the default UI profile. Run them with `npm run test:ui:stock` when the target backend has inventory. The test flow will fall back to a purchasable product rather than assuming a single stocked SKU.
- The storefront's register flow is a two-step JWT dance (`/auth/customer/emailpass/register` → Bearer `/store/customers`), handled inside `customerClient.register`.
