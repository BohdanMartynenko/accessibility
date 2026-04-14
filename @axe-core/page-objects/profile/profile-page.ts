import { Page, Locator } from '@playwright/test';

export class ProfilePage {
  public readonly page: Page;
  public readonly heading: Locator;
  public readonly editButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 2 }).first();
    this.editButton = page.getByRole('button', { name: 'Edit profile' });
  }

  public async goto() {
    await this.page.goto('/profile');
  }
}
