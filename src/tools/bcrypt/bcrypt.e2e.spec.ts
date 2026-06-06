import { expect, test } from '@playwright/test';

test.describe('Tool - Bcrypt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bcrypt');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Bcrypt - IT Tools');
  });

  test('Hashes a string into a $2a$ bcrypt digest', async ({ page }) => {
    // bcryptjs v3 keeps the same { hashSync, compareSync } named exports.
    const input = page.getByPlaceholder('Your string to bcrypt...');
    await input.fill('hunter2');

    const output = page.locator('input[readonly]').first();
    await expect.poll(
      async () => await output.inputValue(),
      { timeout: 5000 },
    ).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
  });

  test('Compares matching string and hash', async ({ page }) => {
    await page.getByPlaceholder('Your string to bcrypt...').fill('hunter2');
    const hashOutput = page.locator('input[readonly]').first();
    await expect.poll(async () => await hashOutput.inputValue(), { timeout: 5000 }).not.toBe('');
    const hash = await hashOutput.inputValue();

    await page.getByPlaceholder('Your string to compare...').fill('hunter2');
    await page.getByPlaceholder('Your hash to compare...').fill(hash);

    await expect(page.locator('.compare-result.positive')).toHaveText('Yes');
  });
});
