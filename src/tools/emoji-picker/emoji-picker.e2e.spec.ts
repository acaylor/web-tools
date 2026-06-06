import { expect, test } from '@playwright/test';

test.describe('Tool - Emoji picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/emoji-picker');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Emoji picker - IT Tools');
  });

  test('Finds an emoji by name (fuse.js search)', async ({ page }) => {
    await page.getByPlaceholder('Search emojis').fill('grinning');

    await expect(page.getByText('Search result')).toBeVisible();
    await expect(page.getByText('Grinning face', { exact: true })).toBeVisible();
  });

  test('Finds an emoji by an emojilib keyword that is not in its name', async ({ page }) => {
    // "tada" is an emojilib keyword for 🎉 (name: "party popper"); a match proves the
    // emojilib keyword data is wired into the fuse.js index.
    await page.getByPlaceholder('Search emojis').fill('tada');

    await expect(page.getByText('Party popper', { exact: true })).toBeVisible();
  });
});
