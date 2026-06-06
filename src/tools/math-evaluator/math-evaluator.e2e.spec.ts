import { expect, test } from '@playwright/test';

test.describe('Tool - Math evaluator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/math-evaluator');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Math evaluator - IT Tools');
  });

  test('Evaluates an arithmetic expression respecting operator precedence', async ({ page }) => {
    await page.getByPlaceholder('Your math expression').fill('123 * 456');

    await expect(page.getByText('56088')).toBeVisible();
  });

  test('Evaluates a mathjs expression using a constant and a function', async ({ page }) => {
    await page.getByPlaceholder('Your math expression').fill('round(pi * 1000000)');

    await expect(page.getByText('3141593')).toBeVisible();
  });
});
