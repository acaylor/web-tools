import { expect, test } from '@playwright/test';

test.describe('Tool - Case converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/case-converter');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Case converter - IT Tools');
  });

  test('Converts the default string into every supported case', async ({ page }) => {
    await expect(page.getByLabel('Camelcase:')).toHaveValue('loremIpsumDolorSitAmet');
    await expect(page.getByLabel('Pascalcase:')).toHaveValue('LoremIpsumDolorSitAmet');
    await expect(page.getByLabel('Constantcase:')).toHaveValue('LOREM_IPSUM_DOLOR_SIT_AMET');
    await expect(page.getByLabel('Snakecase:')).toHaveValue('lorem_ipsum_dolor_sit_amet');
    // param-case is change-case v5's kebabCase, header-case is trainCase
    await expect(page.getByLabel('Paramcase:')).toHaveValue('lorem-ipsum-dolor-sit-amet');
    await expect(page.getByLabel('Headercase:')).toHaveValue('Lorem-Ipsum-Dolor-Sit-Amet');
  });

  test('Re-converts a custom string, preserving accented letters', async ({ page }) => {
    await page.getByPlaceholder('Your string...').fill('caffè latte');

    await expect(page.getByLabel('Camelcase:')).toHaveValue('caffèLatte');
    await expect(page.getByLabel('Paramcase:')).toHaveValue('caffè-latte');
  });
});
