import { Page, Locator } from '@playwright/test';

export class LoginPage {
  public readonly page: Page;
  public readonly heading: Locator;
  public readonly emailInput: Locator;
  public readonly passwordInput: Locator;
  public readonly submitButton: Locator;
  public readonly errorAlert: Locator;
  public readonly firstInvalidField: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Sign in/i });
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorAlert = page.getByRole('alert');
    this.firstInvalidField = page.locator('.ng-invalid.ng-touched').first();
  }

  public async goto() {
    await this.page.goto('/auth/login');
  }

  public async submitCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
