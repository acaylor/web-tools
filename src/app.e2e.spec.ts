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

  test('Locale storage gets written on boot without throwing (useStorage + syncRef)', async ({ page }) => {
    // The App.vue change passes `locale.value` to useStorage (instead of a ref)
    // and wires a syncRef transform with an rtl-null fallback. The smoke this
    // covers: app boots without throwing, and the storage key is populated.
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();

    const stored = await page.evaluate(() => localStorage.getItem('locale'));
    expect(stored).toBe('en');
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
