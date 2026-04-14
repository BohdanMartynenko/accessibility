import { test, expect } from '../../fixtures/a11y';
import { LoginPage } from '../../page-objects/auth/login-page';

test.describe.configure({ mode: 'parallel' });

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
