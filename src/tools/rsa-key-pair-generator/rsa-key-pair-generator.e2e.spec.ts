import { expect, test } from '@playwright/test';

test.describe('Tool - RSA key-pair generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rsa-key-pair-generator');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('RSA key pair generator - IT Tools');
  });

  test('Renders public and private key blocks without throwing', async ({ page }) => {
    // The `certs` ref starts as `undefined` under the new VueUse typings (see
    // `certs?.publicKeyPem ?? ''` in the template); make sure the empty render
    // is fine and that, once the async key-pair resolves, the blocks fill in.
    await expect(page.getByRole('heading', { name: 'Public key' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Private key' })).toBeVisible();

    const blocks = page.getByTestId('area-content');
    await expect(blocks).toHaveCount(2);

    // Wait up to 30s for the 2048-bit key-pair to generate.
    await expect.poll(
      async () => (await blocks.first().innerText()).includes('BEGIN'),
      { timeout: 30_000 },
    ).toBe(true);

    const publicBlock = await blocks.first().innerText();
    const privateBlock = await blocks.nth(1).innerText();
    expect(publicBlock).toContain('BEGIN PUBLIC KEY');
    expect(publicBlock).toContain('END PUBLIC KEY');
    expect(privateBlock).toContain('BEGIN RSA PRIVATE KEY');
    expect(privateBlock).toContain('END RSA PRIVATE KEY');
  });
});
