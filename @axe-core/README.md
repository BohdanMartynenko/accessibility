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
