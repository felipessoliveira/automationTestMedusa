# Plan — Commit, push, and open the first Pull Request

## Context

The framework is scaffolded locally in `/Users/felipeoliveira/automationTestMedusa/` with `git init` already run but **no commits and no remote**. This plan takes the current working tree through its first commit, a push to GitHub, and a Pull Request for review.

**Decisions locked in** (confirmed via AskUserQuestion):

- **Host:** GitHub → PR (via `gh`).
- **Branching:** feature branch → PR into `main`.
- **Commit granularity:** single "Initial scaffold" commit.

---

## Preconditions (verify before committing)

| Check | Command | Expected |
|---|---|---|
| `.env` is NOT tracked | `git check-ignore -v .env` | prints `.gitignore:3:.env    .env` (or similar) |
| `node_modules/` is NOT tracked | `git check-ignore -v node_modules/placeholder` | prints a gitignore hit |
| `reports/` / `.DS_Store` ignored | same pattern | ignored |
| No secrets in tracked files | `git diff --cached` after `git add` | only `.env.example` placeholder values visible |
| `gh` authenticated | `gh auth status` | `Logged in to github.com as <user>` |

The `.env.example` already contains real-looking `MEDUSA_PUBLISHABLE_KEY`. That value is the storefront's *publishable* key — safe to commit by design (it's shipped to browsers), but if you prefer to redact, swap it for `<fill-locally>` in `.env.example` before committing and keep the real value only in local `.env`.

---

## Steps

### 1. Prepare working tree

```bash
# Create local .env from the example (already filled in), so runtime config works.
cp .env.example .env

# Confirm .env is gitignored (the framework reads .env, not .env.example).
git check-ignore -v .env
```

### 2. Rename default branch (optional, recommended on GitHub)

GitHub's default is `main`. Rename before the first push so we don't end up with a dangling `master`.

```bash
git branch -m master main
```

### 3. Create feature branch

Per the branching decision, we don't commit straight to `main`. Switch to a feature branch first; the PR will target `main`.

```bash
git switch -c feat/initial-scaffold
```

### 4. Stage + commit

Stage explicitly by directory/file to avoid accidentally capturing `node_modules/`, `reports/`, or `.env` (all gitignored, but explicit is safer).

```bash
git add \
  .gitignore .env.example README.md PLAN.md PLAN_GIT.md \
  package.json package-lock.json tsconfig.json cucumber.js playwright.config.ts \
  features/ fixtures/ src/ scripts/

git status            # sanity check — nothing unexpected staged
git diff --cached     # eyeball the payload
```

Commit with a HEREDOC message:

```bash
git commit -m "$(cat <<'EOF'
Initial scaffold: Playwright + Cucumber (TS, POM) test framework

- Targets Medusa storefront at europe-west1 demo URL.
- Cucumber profiles: default / api / ui; all run with --parallel 4.
- POM layer (BasePage, HomePage, AccountPage, ProductPage, CartPage)
  uses data-testid selectors verified against the live storefront.
- Fixture-driven test data: JSON templates in fixtures/{users,products}
  merged with Scenario Outline Examples via utils/fixtures.ts.
- API client (src/api) wraps Playwright APIRequestContext for
  /store/customers and /store/auth/customer.
- Support layer: tag-scoped hooks, Allure reporter, dotenv config.
- Discovery probe under scripts/ for finding Medusa backend params.

Known blockers (tracked in PLAN.md):
- @api create-user needs a real backend URL + publishable key in .env.
- @ui login needs a pre-seeded shared user.
- @ui add-to-cart needs a stocked Medusa backend.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

### 5. Create remote repo + push

```bash
# Create a private repo named "automationTestMedusa" and set origin in one shot.
gh repo create automationTestMedusa --private --source=. --remote=origin

# Push feature branch and set upstream.
git push -u origin feat/initial-scaffold

# Push main as well so the PR has a base to target.
git push origin main
```

> If you'd rather keep the repo local only and skip remote creation, stop after step 4.

### 6. Open the PR

```bash
gh pr create \
  --base main \
  --head feat/initial-scaffold \
  --title "Initial Playwright + Cucumber test scaffold" \
  --body "$(cat <<'EOF'
## Summary
- Adds the Playwright + Cucumber (TypeScript, Page Object Model) test framework for the Medusa storefront.
- API + UI scenarios: create user (API + UI), login (UI), add product to cart (UI).
- Parallel execution (`--parallel 4`), Allure reporting, JSON fixture templates overridden per Scenario Outline.

## Test plan
- [ ] `npm install && npx playwright install chromium`
- [ ] `cp .env.example .env` and confirm `MEDUSA_API_URL` / `MEDUSA_PUBLISHABLE_KEY` are populated
- [ ] `npm run test:api` → `@api` create-user passes
- [ ] `npx ts-node scripts/seed_shared_user.ts` (once Phase B lands) to seed the shared user
- [ ] `npm run test:ui` → `@ui` create-user + login pass (cart excluded by default)
- [ ] `npm run report:gen && npm run report:open` → Allure report opens with 3 green scenarios

## Known blockers (non-blocking for merge — documented in `PLAN.md`)
- `@ui` add-to-cart requires a stocked Medusa backend; tagged `@requires-stock` and gated behind `npm run test:ui:stock`.
- `@api` and `@ui` login require live env values in `.env`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 7. Report PR URL

`gh pr create` prints the URL to stdout. Capture + echo so it's visible in the terminal.

---

## Verification

After step 6, confirm on GitHub:

- Branch `feat/initial-scaffold` shows all scaffold files, no `node_modules`, no `.env`.
- PR is open against `main`.
- PR description renders correctly.
- CI (none configured yet) does not block merge.

---

## Risks / open items

- **Publishable key visibility.** `.env.example` currently contains a real `pk_...` value. That key is designed to be client-visible (it ships in the storefront JS bundle), so committing it is not technically a secret leak, but some orgs treat all keys uniformly. If you'd rather redact, I'll swap the value to `<fill-locally>` before committing.
- **`gh` auth scope.** `gh repo create` needs the `repo` scope. `gh auth status` will show this; run `gh auth refresh -s repo` if missing.
- **Default branch name.** If the remote repo's default is `master`, the PR base must be `master` instead of `main`. Adjust step 6 accordingly.

---

## Out of scope for this PR

- CI workflow (GitHub Actions) — add in a follow-up.
- Seed-shared-user script + cart `@requires-stock` guard — covered by PLAN.md Phases B and C; can land in a separate PR or be added to this one if preferred before review.
