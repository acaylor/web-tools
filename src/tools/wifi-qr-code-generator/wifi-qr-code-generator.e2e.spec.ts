import { expect, test } from '@playwright/test';

test.describe('Tool - WiFi QR code generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wifi-qrcode-generator');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('WiFi QR Code generator - IT Tools');
  });

  test('Renders a QR code image when SSID and password are provided', async ({ page }) => {
    // The default encryption is WPA, which requires a password for a QR to
    // be generated (see useQRCode.getQrCodeText).
    await page.getByPlaceholder('Your WiFi SSID...').fill('TestNetwork');
    await page.getByPlaceholder('Your WiFi Password...').fill('supersecret');

    const img = page.locator('img[alt="wifi-qrcode"]');
    await expect(img).toBeVisible({ timeout: 10_000 });
    await expect.poll(
      async () => (await img.getAttribute('src')) ?? '',
      { timeout: 10_000 },
    ).toMatch(/^data:image\/(png|gif)/);
  });
});
