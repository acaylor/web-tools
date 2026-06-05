import { expect, test } from '@playwright/test';

test.describe('Tool - QR code generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qrcode-generator');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('QR Code generator - IT Tools');
  });

  test('Renders a QR code image from the default text', async ({ page }) => {
    // useQRCode pipes the rendered base64 PNG into the <n-image> src.
    // Reproduces the MaybeRef-from-vue import path under @vueuse/core 14.
    const img = page.locator('img').first();
    await expect(img).toBeVisible();
    await expect.poll(
      async () => (await img.getAttribute('src')) ?? '',
      { timeout: 10_000 },
    ).toMatch(/^data:image\/(png|gif)/);
  });
});
