import { test, expect } from '../../fixtures/a11y';
import { ProfilePage } from '../../page-objects/profile/profile-page';
import { EditProfileDialog } from '../../page-objects/profile/edit-profile-dialog';

test.describe.configure({ mode: 'parallel' });

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
