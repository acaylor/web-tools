import { expect, test } from '@playwright/test';

test.describe('Tool - JWT parser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jwt-parser');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('JWT parser - IT Tools');
  });

  test('Parses the default JWT into header and payload claims', async ({ page }) => {
    // The default JWT is HS256(sub=1234567890, name=John Doe, iat=1516239022).
    // The header section lists `alg` and `typ`; the payload section lists `sub`, `name`, `iat`.
    // Reproduces the jwt-decode v4 named-export switch (`{ jwtDecode }`).
    // Each cell text includes the claim description suffix (e.g. "alg (Algorithm)").
    await expect(page.getByRole('cell', { name: 'alg (Algorithm)' })).toBeVisible();
    await expect(page.getByRole('cell', { name: /HS256/ })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'name (Full name)' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'John Doe', exact: true })).toBeVisible();
  });

  test('Flags an invalid JWT', async ({ page }) => {
    const input = page.getByPlaceholder('Put your token here...');
    await input.fill('this-is-not-a-jwt');
    await expect(page.getByText('Invalid JWT')).toBeVisible();
  });
});
