# Accessibility Testing with Playwright

Automated WCAG 2.x compliance and VoiceOver screen reader tests using [Playwright](https://playwright.dev), [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright), and [Guidepup Playwright](https://github.com/guidepup/guidepup-playwright).

## Overview

This demo showcases a layered accessibility testing approach:

| Layer | Tool | What it catches |
|-------|------|-----------------|
| **WCAG audit** | axe-core | Color contrast, missing labels, ARIA violations, heading order, etc. |
| **Screen reader** | Guidepup + VoiceOver | Announcements, focus order, navigation landmarks, interactive elements |

## Project Structure

```
demo/accessibility/
  fixtures/
    a11y.ts                   # axe-core fixture (WCAG 2.x tags)
    voiceover-helpers.ts      # VoiceOver navigation utilities
  page-objects/
    dashboard/
      dashboard-page.ts       # Dashboard page object
    profile/
      profile-page.ts         # Profile page object
      edit-profile-dialog.ts  # Edit profile dialog object
    auth/
      login-page.ts           # Login page object
  specs/
    dashboard/
      dashboard.spec.ts       # Dashboard WCAG audit
    profile/
      profile.spec.ts         # Profile page + dialog WCAG audit
    auth/
      login.spec.ts           # Login page WCAG audit (multiple states)
    voiceover/
      dashboard.voiceover.spec.ts  # VoiceOver navigation test
```

## Fixture: `a11y`

A custom Playwright fixture wrapping axe-core, pre-configured with WCAG 2.x tags:

```typescript
// fixtures/a11y.ts
import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

type AxeFixture = {
  a11y: (selector?: string) => AxeBuilder;
};

export const test = base.extend<AxeFixture>({
  a11y: async ({ page }, use) => {
    await use((selector?: string) => {
      const builder = new AxeBuilder({ page }).withTags(wcagTags);
      return selector ? builder.include(selector) : builder;
    });
  },
});

export { expect } from '@playwright/test';
```

### Usage patterns

**Full page audit:**
```typescript
expect((await a11y().analyze()).violations).toEqual([]);
```

**Scoped to a dialog:**
```typescript
expect((await a11y('[role="dialog"]').analyze()).violations).toEqual([]);
```

**After triggering error states:**
```typescript
await loginPage.submitButton.click();
await expect(loginPage.errorAlert).toBeVisible();
expect((await a11y().analyze()).violations).toEqual([]);
```

## WCAG Spec Examples

### Simple page audit

```typescript
test.describe('Dashboard page', { tag: '@a11y' }, () => {
  test('has no WCAG violations', async ({ page, a11y }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await expect(dashboardPage.heading).toBeVisible();

    expect((await a11y().analyze()).violations).toEqual([]);
  });
});
```

### Page with dialog states

```typescript
test.describe('Profile page', { tag: '@a11y' }, () => {
  test('has no WCAG violations', async ({ page, a11y }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    await expect(profilePage.heading).toBeVisible();

    expect((await a11y().analyze()).violations).toEqual([]);
  });

  test('edit profile dialog has no WCAG violations', async ({ page, a11y }) => {
    const profilePage = new ProfilePage(page);
    const editDialog = new EditProfileDialog(page);

    await profilePage.goto();
    await profilePage.editButton.click();
    await editDialog.waitForOpen();

    expect((await a11y('[role="dialog"]').analyze()).violations).toEqual([]);
  });
});
```

### Multiple error states (unauthenticated pages)

```typescript
test.describe('Login page', { tag: '@a11y' }, () => {
  test('has no WCAG violations', async ({ page, a11y }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();

    expect((await a11y().analyze()).violations).toEqual([]);
  });

  test('has no WCAG violations after failed login', async ({ page, a11y }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.submitCredentials('invalid@example.com', 'WrongPass123!');
    await expect(loginPage.errorAlert).toBeVisible();

    expect((await a11y().analyze()).violations).toEqual([]);
  });

  test('has no WCAG violations with empty form submission', async ({ page, a11y }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.submitButton.click();
    await expect(loginPage.firstInvalidField).toBeVisible();

    expect((await a11y().analyze()).violations).toEqual([]);
  });
});
```

## VoiceOver Tests

Screen reader tests verify that key page elements are announced correctly via macOS VoiceOver.

### macOS Setup

```bash
# 1. Run automated setup
npx @guidepup/setup

# 2. Allow VoiceOver to be controlled with AppleScript
#    VoiceOver Utility → General → "Allow VoiceOver to be controlled with AppleScript"

# 3. Grant Accessibility permissions to your terminal app
#    System Settings → Privacy & Security → Accessibility → add terminal app
```

### Example VoiceOver spec

```typescript
import { voiceOverTest as test } from '@guidepup/playwright';
import { expect } from '@playwright/test';

test.describe('Dashboard VoiceOver', { tag: ['@a11y', '@voiceover'] }, () => {
  test('can navigate page content and user menu', async ({ page, voiceOver }) => {
    await page.goto('/dashboard', { waitUntil: 'load' });
    await page.getByRole('heading', { name: /welcome/i }).waitFor();
    await voiceOverDelay();

    await voiceOver.navigateToWebContent();
    await voiceOverDelay();

    // Navigate to heading
    await navigateUntilFound(
      voiceOver,
      'Welcome',
      () => voiceOver.perform(voiceOver.keyboardCommands.findNextHeading),
    );

    // Navigate sidebar links
    await navigateUntilFound(
      voiceOver,
      'Courses',
      () => voiceOver.perform(voiceOver.keyboardCommands.findNextLink),
    );
    await navigateUntilFound(
      voiceOver,
      'Settings',
      () => voiceOver.perform(voiceOver.keyboardCommands.findNextLink),
    );

    // Verify announcements
    const spoken = (await voiceOver.spokenPhraseLog()).join(' ');
    expect(spoken).toContain('Welcome');
    expect(spoken).toContain('Courses');
    expect(spoken).toContain('Settings');
  });
});
```

### VoiceOver helpers

```typescript
export function voiceOverDelay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function navigateUntilFound(
  voiceOver: VoiceOverPlaywright,
  text: string,
  command: () => Promise<void>,
  maxSteps = 10,
) {
  for (let i = 0; i < maxSteps; i++) {
    await command();
    await voiceOver.perform(voiceOver.keyboardCommands.describeItem);
    if ((await voiceOver.itemText()).includes(text)) return;
  }
  throw new Error(`Could not find "${text}" within ${maxSteps} steps`);
}
```

## Playwright Config

### WCAG tests (runs in all browsers)

```typescript
// playwright.config.ts
{
  name: 'Desktop Chrome',
  testDir: './tests/ui/tests',
  use: {
    ...devices['Desktop Chrome'],
    storageState: 'playwright/.auth/user.json',
  },
  dependencies: ['auth setup'],
}
```

### VoiceOver tests (Safari only, non-headless)

```typescript
// playwright.voiceover.config.ts
import { screenReaderConfig } from '@guidepup/playwright';

export default defineConfig({
  ...screenReaderConfig,
  testDir: './tests/accessibility/voiceover',
  timeout: 5 * 60 * 1000,  // VoiceOver adds ~10s overhead per test
  retries: 2,
  projects: [
    { name: 'auth setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'VoiceOver',
      use: {
        ...devices['Desktop Safari'],
        headless: false,  // VoiceOver requires a visible browser window
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['auth setup'],
    },
  ],
});
```

## Running

```bash
# All WCAG tests
npx playwright test --grep @a11y

# VoiceOver tests (macOS only)
npx playwright test --config=playwright.voiceover.config.ts
```

## Dependencies

```json
{
  "@axe-core/playwright": "^4.11.1",
  "@guidepup/playwright": "^0.15.0",
  "@playwright/test": "^1.58.2"
}
```

## Key Patterns

1. **Tag all a11y specs with `@a11y`** -- enables running them as a focused suite
2. **Test multiple states** -- default, error, validation, dialog open -- not just the happy path
3. **Scope axe analysis** -- use `a11y('[role="dialog"]')` to audit just a dialog instead of the full page
4. **Page objects abstract selectors** -- specs read as intent, not implementation
5. **VoiceOver tests are separate** -- they require Safari, non-headless mode, and macOS; keep them in a dedicated config
