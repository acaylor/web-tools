import { expect, test } from '@playwright/test';

test.describe('App shell', () => {
  test('Home renders without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await expect(page).toHaveTitle(/IT Tools|Web Tools/);
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('Navigates between tools without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await page.goto('/json-prettify');
    await expect(page).toHaveTitle(/JSON prettify and format/);
    await page.goto('/yaml-prettify');
    await expect(page).toHaveTitle(/YAML prettify and format/);
    await page.goto('/qrcode-generator');
    await expect(page).toHaveTitle(/QR Code generator/);
    await page.goto('/');
    await expect(page).toHaveTitle(/IT Tools|Web Tools/);

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('Locale persists across reload (useStorage + i18n init)', async ({ page }) => {
    // Regression check for App.vue: on boot, the i18n locale must be
    // initialized from localStorage. The previous syncRef-based wiring would
    // clobber the saved value with the i18n default on every reload.
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'All the tools' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('locale'))).toBe('en');

    await page.evaluate(() => localStorage.setItem('locale', 'de'));
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Alle Tools' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('locale'))).toBe('de');

    expect(errors, errors.join('\n')).toEqual([]);
  });
});
