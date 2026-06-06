import { expect, test } from '@playwright/test';

test.describe('Tool - Hash text', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hash-text');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Hash text - IT Tools');
  });

  test('MD5("hello") matches the known hex digest', async ({ page }) => {
    // crypto-js patch bump smoke. MD5("hello") = 5d41402abc4b2a76b9719d911017c592.
    await page.getByPlaceholder('Your string to hash...').fill('hello');
    const md5Row = page.locator('.n-input-group').filter({ hasText: /^MD5/ });
    await expect.poll(
      async () => (await md5Row.locator('input').inputValue()) ?? '',
      { timeout: 3000 },
    ).toBe('5d41402abc4b2a76b9719d911017c592');
  });
});
