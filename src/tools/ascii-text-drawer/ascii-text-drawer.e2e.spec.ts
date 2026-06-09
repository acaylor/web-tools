import { expect, test } from '@playwright/test';

test.describe('Tool - ASCII text drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ascii-text-drawer');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('ASCII Art Text Generator - IT Tools');
  });

  test('Renders ASCII art for the default font (fonts are bundled, no CDN)', async ({ page }) => {
    // The bug (#39): output never rendered because fonts were fetched from a
    // third-party CDN at runtime. Fonts are now bundled, so output must appear.
    await expect(page.getByText('Current settings resulted in error.')).toBeHidden();

    const output = page.getByTestId('area-content');
    await expect(output).toBeVisible();

    const art = (await output.innerText()).trim();
    // figlet Standard art for "Ascii ART" is multi-line and contains slash/underscore glyphs
    expect(art.split('\n').length).toBeGreaterThan(3);
    expect(art).toMatch(/[/\\_|]/);
    expect(art).not.toEqual('Ascii ART');
  });

  test('Switching to another font loads it on demand and re-renders', async ({ page }) => {
    const output = page.getByTestId('area-content');
    const standardArt = (await output.innerText()).trim();

    // pick a visually distinct font via the searchable select
    await page.getByPlaceholder('Select font to use').click();
    await page.getByText('Banner3', { exact: true }).click();

    await expect(page.getByText('Current settings resulted in error.')).toBeHidden();
    await expect(async () => {
      const bannerArt = (await output.innerText()).trim();
      expect(bannerArt.length).toBeGreaterThan(10);
      expect(bannerArt).not.toEqual(standardArt);
    }).toPass();
  });
});
