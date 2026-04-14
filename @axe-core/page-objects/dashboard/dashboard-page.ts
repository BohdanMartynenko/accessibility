import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  public readonly page: Page;
  public readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Welcome/i });
  }

  public async goto() {
    await this.page.goto('/dashboard');
  }
}
