# automationTestMedusa

Playwright + Cucumber (TypeScript, Page Object Model) automation tests for the Medusa storefront at
`https://medusa-storefront-839705751382.europe-west1.run.app/es/store`.

## Setup

```bash
npm install
npm run pw:install
cp .env.example .env
# fill in MEDUSA_API_URL, MEDUSA_PUBLISHABLE_KEY, TEST_USER_*
```

## Run

```bash
npm run test         # all scenarios
npm run test:api     # @api scenarios only
npm run test:ui      # @ui scenarios only
```

## Reports

```bash
npm run report:gen
npm run report:open
```

## Layout

- `features/` — Gherkin feature files (grouped by `api/` and `ui/`).
- `fixtures/` — JSON templates (users, products). Scenarios override selected fields via the `Examples:` table.
- `src/pages/` — Page Objects.
- `src/api/` — API clients and typed models.
- `src/steps/` — Cucumber step definitions.
- `src/support/` — World, hooks, config, Allure wiring.
- `src/utils/` — `loadFixture`, `mergeFixture`, faker helpers.
