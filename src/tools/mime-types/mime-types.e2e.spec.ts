import { expect, test } from '@playwright/test';

test.describe('Tool - MIME types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mime-types');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('MIME types - IT Tools');
  });

  test('Renders the mime-type / extension reference table from the library data', async ({ page }) => {
    const pdfRow = page.getByRole('row').filter({ hasText: 'application/pdf' }).first();

    await expect(pdfRow).toBeVisible();
    await expect(pdfRow).toContainText('.pdf');
  });
});
