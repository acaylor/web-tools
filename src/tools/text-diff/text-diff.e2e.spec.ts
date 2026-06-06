import { expect, test } from '@playwright/test';

test.describe('Tool - Text diff', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/text-diff');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Text diff - IT Tools');
  });

  test('Mounts the monaco diff editor with its default models', async ({ page }) => {
    // c-diff-editor seeds the original/modified panes with placeholder text;
    // a rendered monaco instance confirms the monaco-editor upgrade still mounts.
    await expect(page.locator('.monaco-diff-editor')).toBeVisible();
    await expect(page.getByText('original text')).toBeVisible();
    await expect(page.getByText('modified text')).toBeVisible();
  });
});
