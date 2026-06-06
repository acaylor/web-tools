import { expect, test } from '@playwright/test';

test.describe('Tool - UUIDs generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/uuid-generator');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('UUIDs generator - IT Tools');
  });

  test('Generates a v4 UUID by default', async ({ page }) => {
    const output = page.getByPlaceholder('Your uuids');
    const value = await output.inputValue();
    expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  test('Refresh produces a different UUID', async ({ page }) => {
    const output = page.getByPlaceholder('Your uuids');
    const before = await output.inputValue();
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect.poll(async () => await output.inputValue(), { timeout: 2000 }).not.toBe(before);
  });

  test('NIL produces the all-zero UUID', async ({ page }) => {
    await page.getByRole('button', { name: 'NIL', exact: true }).click();
    const output = page.getByPlaceholder('Your uuids');
    await expect(output).toHaveValue('00000000-0000-0000-0000-000000000000');
  });
});
