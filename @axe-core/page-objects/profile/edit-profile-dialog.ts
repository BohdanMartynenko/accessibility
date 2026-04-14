import { Page, Locator } from '@playwright/test';

export class EditProfileDialog {
  public readonly page: Page;
  public readonly title: Locator;
  public readonly firstNameInput: Locator;
  public readonly lastNameInput: Locator;
  public readonly bioTextarea: Locator;
  public readonly cancelButton: Locator;
  public readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;

    const dialog = page.getByRole('dialog');
    this.title = dialog.getByRole('heading');
    this.firstNameInput = dialog.locator('#first_name');
    this.lastNameInput = dialog.locator('#last_name');
    this.bioTextarea = dialog.locator('#bio');
    this.cancelButton = dialog.getByRole('button', { name: 'Cancel' });
    this.saveButton = dialog.getByRole('button', { name: 'Save' });
  }

  public async waitForOpen() {
    await this.title.waitFor({ state: 'visible' });
  }
}
