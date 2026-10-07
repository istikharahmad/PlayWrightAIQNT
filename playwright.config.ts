import { PlaywrightTestConfig } from '@playwright/test';
import { config as dotenvxConfig } from '@dotenvx/dotenvx';

const env = process.env.CALROM_TEST_ENV || 'local.gds-mock.baww';

if (!process.env.CI) {
    dotenvxConfig({ path: `./.env.${env}`, override: true });
}

const skipAgencySetup = process.env.SKIP_AGENCY_SETUP === 'true';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    testDir: './tests',
    /* Maximum time one test can run for. */
    timeout: 180 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 30 * 1000,
        toHaveScreenshot: { maxDiffPixels: 100 },
    },
    /* Run tests in files in parallel */
    fullyParallel: false,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: Boolean(process.env.CI),
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 4 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: process.env.CI
        ? [['html', { open: 'never' }], ['list'], ['github'], ['json', { outputFile: './playwright-report/results.json' }]]
        : [['html', { open: 'never' }], ['list']],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 10 * 1000,
        /* Base URL to use in actions like `await page.goto('/')`. */
        // BaseURL: 'http://localhost:3000',
        ignoreHTTPSErrors: true,
        viewport: { width: 1920, height: 1080 },

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on',
        video: process.env.CI ? 'off' : 'retain-on-failure',
        screenshot: 'only-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        /**
         * Phase 1 — Setup: runs the entry scenario in a single thread before
         * anything else. If this project fails, all dependent projects are
         * skipped automatically by Playwright's project-dependency engine.
         */
        {
            name: 'setup',
            testMatch: '**/*.setup.ts',
            workers: 1,
        },
        /**
         * Phase 2 — Functional suite: starts only after 'setup' passes.
         * Playwright automatically re-runs 'setup' first even when a developer
         * targets a single spec file directly (e.g. npx playwright test tests/BAWW/test_case_1_03.spec.ts).
         */
        {
            name: 'all',
            testMatch: '**/*.spec.ts',
            testIgnore: '**/dbg.spec.ts',
            dependencies: skipAgencySetup ? [] : ['setup'],
        },
        {
            name: 'dbg',
            testMatch: '**/dbg.spec.ts',
        },
    ],
};

export default config;
