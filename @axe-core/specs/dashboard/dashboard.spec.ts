import { test, expect } from '../../fixtures/a11y';
import { DashboardPage } from '../../page-objects/dashboard/dashboard-page';

test.describe('Dashboard page', { tag: '@a11y' }, () => {
  test('has no WCAG violations', async ({ page, a11y }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await expect(dashboardPage.heading).toBeVisible();

    expect((await a11y().analyze()).violations).toEqual([]);
  });
});
