import { expect, test } from '@playwright/test';

test.describe('Tool - MAC address lookup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mac-address-lookup');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('MAC address lookup - IT Tools');
  });

  test('Resolves the vendor of the default MAC address from oui-data', async ({ page }) => {
    // default address 20:37:06:... -> OUI 203706 -> Cisco
    await expect(page.getByText('Cisco Systems, Inc')).toBeVisible();
  });

  test('Updates the vendor when the MAC address changes', async ({ page }) => {
    await page.getByPlaceholder('Type a MAC address').fill('FF:FF:FF:FF:FF:FF');

    await expect(page.getByText('Unknown vendor for this address')).toBeVisible();
  });
});
