# Repository Guidelines

## Project Structure & Module Organization
This repository contains Medusa storefront automation using Playwright, Cucumber, and TypeScript. Place Gherkin specs in `features/ui` or `features/api`, JSON templates in `fixtures/`, and ad hoc utilities in `scripts/`. Application-facing test code lives in `src/`: page objects in `src/pages`, API clients and DTOs in `src/api`, step definitions in `src/steps`, shared hooks/world/config in `src/support`, and helpers in `src/utils`.

## Build, Test, and Development Commands
Use `npm install` to install dependencies and `npm run pw:install` to download Chromium. Run `npm test` for the full suite, `npm run test:ui` for `@ui` scenarios, `npm run test:api` for `@api`, and `npm run test:serial` when debugging flaky or stateful flows. Build Allure output with `npm run report:gen` and inspect it with `npm run report:open`. Seed the shared test account with `npx ts-node scripts/seed_shared_user.ts`.

## Coding Style & Naming Conventions
Match the existing TypeScript style: 2-space indentation, semicolons, single quotes, `async`/`await`, and strict typing. Keep page objects and models in PascalCase files such as `AccountPage.ts` and `customer.ts` types/interfaces aligned with their domain. Name step files `*.steps.ts`; keep feature files descriptive and lowercase, for example `add_product_to_cart.feature`. Reuse the configured path aliases (`@pages/*`, `@api/*`, `@support/*`, `@utils/*`) when they improve readability.

## Testing Guidelines
The test runner is `cucumber-js` with Playwright-backed UI hooks and Allure reporting. Prefer `Scenario Outline` plus fixture-driven overrides instead of duplicating payloads in feature files. Keep tags accurate (`@ui`, `@api`, and any environment-specific tags) so profile filtering stays reliable. Before opening a PR, run the relevant suite locally and confirm artifacts are written under `reports/allure-results`.

## Commit & Pull Request Guidelines
Git history is minimal, but current commits use short imperative subjects such as `Initial scaffold: Playwright + Cucumber (TS, POM) test framework`. Follow that pattern: concise subject, optional scope after a colon, and one logical change per commit. PRs should describe the scenario coverage added or changed, list any required `.env` or backend setup, and attach evidence for behavior changes when useful, such as an Allure screenshot for UI coverage.

## Security & Configuration Tips
Keep secrets and environment-specific values in `.env`; do not commit live credentials. Use `.env.example` as the source of required variables such as `BASE_URL`, `MEDUSA_API_URL`, and shared test-user credentials.
