import { expect, test } from '@playwright/test';

test.describe('Tool - IPv4 address converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ipv4-address-converter');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('IPv4 address converter - IT Tools');
  });

  test('Tolerates a cleared input without throwing', async ({ page }) => {
    // Reproduces the null-guard added when v6/strict types started letting
    // `undefined` reach the validator: `validator: ip => isValidIpv4({ ip: ip ?? '' })`.
    const input = page.getByPlaceholder('The ipv4 address...');
    await input.fill('192.168.1.1');
    await input.fill('');
    await expect(input).toHaveValue('');
  });
});
