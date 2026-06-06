import { expect, test } from '@playwright/test';

test.describe('Tool - ETA calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/eta-calculator');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('ETA calculator - IT Tools');
  });

  test('Computes the total duration via date-fns formatDuration', async ({ page }) => {
    // With the default inputs (186 units, 3 per 5 minutes) the total duration is 5h10m.
    await expect(page.getByText('5 hours 10 minutes')).toBeVisible();
  });
});
