# THEO Next-Gen E2E Tests

Playwright + TypeScript end-to-end automation framework for the **Calrom BAWW** group booking application.

## 1. Tech Stack

| Category | Package | Version |
|---|---|---|
| Test runner | `@playwright/test` | ^1.59.1 |
| Language | `typescript` | 6.0.2 |
| Logging | `winston` | ^3.19.0 |
| Environment | `@dotenvx/dotenvx` | ^1.60.2 |
| Dates | `date-fns` | ^4.1.0 |
| Random data | `chance` | ^1.1.13 |
| DOM (AI fallback) | `jsdom` | ^29.0.2 |
| HTTP status codes | `http-status-codes` | ^2.3.0 |
| Linting | `eslint` + `eslint-plugin-playwright` | 10.2.0 |
| Formatting | `prettier` | 3.8.1 |
| Git hooks | `husky` + `lint-staged` | 9.1.7 |

---

## 2. Setup & Running Tests

### Environment variables

Create a `.env.<name>` file in the project root (e.g. `.env.stage.baww`).  
Set `CALROM_TEST_ENV=<name>` to tell Playwright which file to load. Defaults to `stage.baww`.

**Required**

| Variable | Description |
|---|---|
| `BASE_URL` | Target application URL |
| `SUPER_ADMIN_USERNAME` | Super-admin login username |
| `SUPER_ADMIN_PASSWORD` | Super-admin login password |

**Optional — AI fallback locator**

| Variable | Default | Description |
|---|---|---|
| `AI_FALLBACK_LOCATOR_ENABLE` | `false` | Enables AI-powered locator fallback |
| `SMART_LOCATOR_LLM_API_URL` | `dummy` | LLM API endpoint |
| `SMART_LOCATOR_LLM_MODEL` | `dummy` | LLM model name |
| `SMART_LOCATOR_LLM_API_KEY` | `dummy` | LLM API key |
| `LOGGER_HTTP_BODY_TRIM_THRESHOLD` | `500` | Max chars logged per request body |

### Running tests via CLI

```bash
# Install browsers + run all tests
npm test

# Run a specific file
npx playwright test tests/BAWW/baww-1.spec.ts

# Run a specific Playwright project
npx playwright test --project=all   # all *.spec.ts except dbg.spec.ts
npx playwright test --project=dbg   # dbg.spec.ts only

# Filter by tag
npx playwright test --grep @smoke
npx playwright test --grep @regression

# Interactive UI mode
npx playwright test --ui

# Debug mode (Playwright Inspector)
npx playwright test --debug

# Open HTML report from last run
npm run report

# Lint
npm run lint
npm run lint:fix

# Format
npm run prettier

# Type-check only (no emit)
npm run compile
```

### Running the seed test via playwright-test MCP

Agents that have the `playwright-test` MCP server available should use this workflow to verify the environment before exploring or planning tests:

1. Call `playwright-test/planner_setup_page` once to initialise the MCP session.
2. Call `playwright-test/test_list` to confirm available tests are discovered.
3. Call `playwright-test/test_run` with the seed spec as a smoke check:

```json
{ "file": "tests/seed.spec.ts" }
```

A passing seed run confirms that credentials, `BASE_URL`, and browser setup are all correct before any further automation work begins.

---

## 3. Generating a Test Automatically

The **UI Pipeline Orchestrator** agent turns a plain-English test case description into a fully working, ready-to-run Playwright test. No coding knowledge is required to kick it off.

### What you need before you start

1. **A test case file** — a short `.md` file in `specs/*/` that describes what the test should do.  
   Use any existing file (e.g. [specs/BAWW/test_case_1_03.md](specs/BAWW/test_case_1_03.md)) as a template.  
   The file must start with this header block:

   ```
   ---
   testId: BAWW-1.XX
   priority: 1
   title: Short description of the test
   ---
   Plain English steps here.
   ```

2. **GitHub Copilot Chat open** in VS Code (the chat panel on the left or via `Ctrl+Shift+I`).

3. **The application running** and your `.env` file configured (see [Section 2](#2-setup--running-tests)).

### Step-by-step

**Step 1 — Open the agent**

In the Copilot Chat panel, click the agent picker (the `@` icon or the model/agent selector at the top of the chat) and choose **UI Pipeline Orchestrator**.

**Step 2 — Give it the test case file path**

Type a prompt in free human readable format, like:

```
generate a test for test case 1_03
or
specs/BAWW/test_case_1_03.md
```
There are no strict format requirements, the main thing it should allow to spot test case we need to cover with no ambiguity.

That's it. The agent takes the file path and handles everything from here.

**Step 3 — Watch it work (three automatic phases)**

The agent runs three phases in sequence — you will see progress messages for each:

| Phase | What happens | Artifacts produced | Stop point |
|---|---|---|---|
| **1. Analysis** | The agent opens the application in a browser, navigates through the relevant screens, and captures all the element locators and expected values needed for the test. | `specs/BAWW/test_case_1_XX-instruction.md` — a detailed human-readable instruction file listing every step, locator, and expected outcome. | Runs automatically — no confirmation needed. |
| **2. Generation** | A detailed test file and any required page objects / action files are created and compiled. The test is executed automatically; the agent fixes any failures it encounters. | `tests/BAWW/test_case_1_XX.spec.ts` (test spec), updated files in `src/pages/` and `src/actions/` if new locators or flows were needed, and a Playwright HTML report under `playwright-report/`. | **Pauses here.** Once tests are green the agent shows a summary and asks: _proceed to code review, or stop?_ Reply `yes` to review or `no` to finish. |
| **3. Code review** | The generated code is reviewed against project standards and any remaining issues are reported. | A severity-ranked findings list in the chat (Blocker / High / Medium / Low). No files are changed — the review is advisory only unless you ask the agent to fix the findings. | **Pauses here.** After review the agent presents the final summary and waits for your confirmation before wrapping up. |

**Step 4 — Review the result**

When the agent finishes, it shows a summary of what was created and whether the test passed. Open the HTML report to see the full run details:

```bash
npm run report
```

### Tips

- If the agent asks you a question during analysis (e.g. "which environment should I use?"), just answer in plain text in the chat.
- When agent asks for permission for the next step click Allow (you may choose Always allow during this session).
- You can ask for a code review at any point by typing `review` in the chat after generation completes.
- To re-run only the generated test:
  ```bash
  npx playwright test tests/BAWW/test_case_1_XX.spec.ts
  ```
- For headed mode to see browser execution you may run:
    ```bash
    npx playwright test tests/BAWW/test_case_1_XX.spec.ts --headed
    ```
- You will see all changes in Copilot window and may keep or undo them
- If any corrections needed to the result you got they can be made either directly or via additional prompts in current Copilot chat.
---

## 4. Wiring a Test to the GDS Mock Service

The **GDS Mock Pipeline Orchestrator** extends the UI Pipeline with full GDS Mock integration.
It runs the complete UI Pipeline first (analyse → generate → review), then records live Amadeus
SOAP traffic and converts it into a reusable mock scenario — so subsequent test runs never hit
the real endpoint.

### Prerequisites

| Requirement | Details |
|---|---|
| **Multi-root workspace** | Both `theo-next-gen-e2e-tests` and `gds-mock` must be open as workspace folders in the **same VS Code multi-root workspace**. The orchestrator resolves cross-repo paths using `../gds-mock/` relative references — they will not resolve if only one repo is open. |
| **GDS Mock running** | Before Phase B starts, the mock must be running: navigate to the `gds-mock` workspace root and run `dotnet run --project src/Calrom.GdsMock.Host`. |
| **Recording configured** | `src/Calrom.GdsMock.Host/appsettings.Development.json` must contain `Mock.Recording.AmadeusEndpointUrl` pointing at the real Amadeus endpoint. This file is gitignored — never commit it. |

### Step-by-step

**Step 1 — Open the agent**

In the Copilot Chat panel, choose **GDS Mock Pipeline Orchestrator** from the agent picker,
or run the `.github/prompts/gds-mock-pipeline-orchestrator.prompt.md` prompt.

**Step 2 — Give it the test case file path and priority**

```
specs/BAWW/test_case_1_26.md
```

**Step 3 — Watch it work (six automatic phases)**

| Phase | What happens | Stop point |
|---|---|---|
| **1. Analysis** | Investigates the live app; produces `specs/BAWW/test_case_1_XX-instruction.md` | Automatic |
| **2. Generation** | Creates `tests/BAWW/test_case_1_XX.spec.ts`; iterates until green | **Pauses** — choose: code review or skip to recording |
| **3. Code review** | Reviews generated files against project conventions (optional) | **Pauses** — confirm GDS Mock is running before Phase B |
| **4. Recording** | Sets recording env vars as inline PowerShell session variables (no `.env` file edited), runs the test against real Amadeus, captures SOAP XML pairs to `../gds-mock/fixtures/recordings/<label>/` | Automatic |
| **5. Scenario creation** | Converts recordings into Scriban templates + `scenario.json` + NUnit integration tests; wires `scenarioId` and `gdsMockOverrides` into the spec; runs `npm run compile` | Automatic |
| **6. Mock verification** | Runs the test with `GDS_MOCK_ENABLE=true`, `GDS_MOCK_RECORDING=false` | **Pauses** — final summary |

### Tips

- If the test spec already contains `scenarioId` (e.g. from a previous pipeline run), Phase A is skipped automatically and the orchestrator jumps straight to Phase B.
- The recording step never modifies any `.env` file — env vars are set for the current terminal session only.
- To run the wired test locally after the pipeline completes, start the GDS Mock first:
  ```powershell
  # in the gds-mock workspace root:
  dotnet run --project src/Calrom.GdsMock.Host

  # in the theo-next-gen-e2e-tests workspace root:
  $env:GDS_MOCK_ENABLE="true"
  $env:GDS_MOCK_URL="http://127.50.50.1:9090"   # default used by the framework; override if needed
  npx playwright test tests/BAWW/test_case_1_XX.spec.ts
  ```

---

## 5. E2E Dashboard

The repository hosts a scheduled workflow that aggregates test results from monitored repos and deploys a live dashboard to GitHub Pages.

### Dashboard URL

The dashboard is available at: **https://calrom-ltd.ghe.com/pages/groups/theo-next-gen-e2e-tests/**

### Prerequisites (one-time, repo admin)

1. **`github-pages` environment** — in repository Settings → Environments, create an environment named exactly `github-pages`. The `deploy-pages` action requires this environment to exist.
2. **`dashboard-data` branch** — initialise the orphan branch that stores aggregated history:
   ```bash
   git checkout --orphan dashboard-data
   git rm -rf .
   echo '[]' > history.json
   echo '{}' > processed-runs.json
   git add history.json processed-runs.json
   git commit -m "chore: initialise dashboard-data branch"
   git push origin dashboard-data
   ```
3. **`DASHBOARD_TOKEN` secret** — create a PAT (classic or fine-grained) with **`actions: read`** scope on each monitored repo and add it as a repository secret named `DASHBOARD_TOKEN` in `theo-next-gen-e2e-tests`. The token must be able to read workflow runs and download artifacts from every repo listed in `dashboard/config.json`. Not required for the first run when `config.repos` is empty.

### Adding a repo to monitor

Edit `dashboard/config.json` and add an entry to the `repos` array:

```json
{
  "repos": [
    {
      "repo": "groups/your-app",
      "workflow": "e2e.yml",
      "artifactName": "playwright-report",
      "displayName": "Your App"
    }
  ],
  "historyDepth": 90,
  "lookbackDays": 30
}
```

Merge the change to `main`. The next scheduled run (every 4 hours) will pick up the new repo, or trigger it immediately with `workflow_dispatch`.

### Refreshing manually

Trigger a run from the Actions tab using the `workflow_dispatch` event on the **E2E Dashboard** workflow.

---

## 6. Project Layout

```
theo-next-gen-e2e-tests/
├── src/
│   ├── actions/
│   │   ├── booking-summary.actions.ts       # Booking summary / PNR actions
│   │   ├── flight-availability.actions.ts   # Flight search results actions
│   │   ├── landing.actions.ts               # Flight search form actions
│   │   ├── login.actions.ts                 # Login/logout actions
│   │   ├── multi-quote.actions.ts           # Multi-quote / booking confirmation actions
│   │   └── registration.actions.ts          # Travel agency registration actions
│   ├── clients/
│   │   └── api.client.ts            # Playwright APIRequestContext wrapper with logging
│   ├── config/
│   │   └── e2e.config.ts            # Typed exports for all env-backed config (credentials, URLs, SmartLocator)
│   ├── fixtures/
│   │   ├── actions.fixture.ts       # Action class fixtures (one property per actions class)
│   │   ├── expect-extended.ts       # Custom expect matchers (SmartLocator / Component support)
│   │   ├── page.fixture.ts          # Page object fixtures (one property per page class)
│   │   ├── smart.fixture.ts         # SmartPage fixture with AI fallback handler (worker-scoped)
│   │   └── ui-test.fixture.ts       # Merged entry point — import { test, expect } from here
│   ├── logging/
│   │   └── logger.ts                # Winston logger (console: info, file: debug → logs/tests.log)
│   ├── pages/
│   │   ├── base.page.ts             # BasePage — provides this.smartPage to all page objects
│   │   ├── booking-summary.page.ts  # Final booking summary with PNR
│   │   ├── flight-availability.page.ts  # Search results
│   │   ├── landing.page.ts          # Flight search form
│   │   ├── login.page.ts            # Login form (canonical page object example)
│   │   ├── multi-quote.page.ts      # Booking confirmation dialog
│   │   └── registration.page.ts     # Travel agency registration form
│   ├── smart/
│   │   ├── fallback-locator-handler.ts  # LLM-based fallback: cleans DOM → asks LLM → returns CSS selector
│   │   ├── smart.locator.ts         # Wraps Playwright Locator; retries via AI fallback on action failure
│   │   └── smart.page.ts            # Wraps Playwright Page; returns SmartLocator from all locator methods
│   ├── types/
│   │   └── api.ts                   # PwAPIResponse<T>, QueryOptions, HttpMethod
│   ├── ui-components/
│   │   └── base.component.ts        # Base class for complex reusable UI widgets only
│   └── utils/
│       ├── api.utils.ts             # toPwApiResponse, toEncodedQueryParams, toEncodedQueryString
│       ├── date.utils.ts            # formatDate, addDays
│       ├── email.utils.ts           # Random/unique e-mail address generation
│       ├── iata.utils.ts            # IATA airport code helpers
│       └── tags.ts                  # smokeTag (@smoke), regressionTag (@regression)
├── tests/
│   ├── seed.spec.ts                 # Minimal smoke test — login only; use to verify environment
│   └── BAWW/
│       └── test_case_1_*.spec.ts    # BAWW test specs (one file per test case ID)
├── specs/
│   └── BAWW/
│       ├── test_case_1_*.md             # Human-readable test case scenarios
│       └── test_case_1_*-instruction.md # Analysed instruction artefacts (generated by test-case-analyzer)
├── logs/                             # Winston log output (debug level, rotated, up to 5 × 500 KB)
├── playwright-report/                # Generated HTML report (open with npm run report)
├── playwright.config.ts              # Test config: timeouts, retries, reporters, projects, trace
├── tsconfig.json                     # TypeScript compiler options
├── eslint.config.js                  # ESLint rules (strict async/await + Playwright plugin)
└── package.json                      # Scripts and dependencies
```
