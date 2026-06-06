import { expect, test } from '@playwright/test';

test.describe('Tool - IPv4 subnet calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ipv4-subnet-calculator');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('IPv4 subnet calculator - IT Tools');
  });

  test('Parses 192.168.0.1/24 into the expected network info', async ({ page }) => {
    // netmask 2.0 -> 2.1 patch bump smoke. Default input is 192.168.0.1/24
    // (held in the input textbox). The table renders the normalized network
    // info: Netmask 192.168.0.0/24, mask 255.255.255.0, size 256, first
    // 192.168.0.1, last 192.168.0.254, broadcast 192.168.0.255.
    await expect(page.getByRole('cell', { name: '192.168.0.0/24', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '255.255.255.0', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '/24', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '256', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '192.168.0.1', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '192.168.0.254', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '192.168.0.255', exact: true })).toBeVisible();
  });
});
