import { type Page, expect, test } from '@playwright/test';
import figlet from 'figlet';

// Route interception doesn't see requests answered by a service worker, so keep
// the PWA out of the way to make the network assertions below deterministic.
test.use({ serviceWorkers: 'block' });

const INPUT = 'Ascii ART';

type TestWindow = Window & { banner3Settled?: Promise<void> };

function render(font: string) {
  return figlet.textSync(INPUT, { font, width: 80, whitespaceBreak: true });
}

function output(page: Page) {
  return page.getByTestId('area-content');
}

async function selectFont(page: Page, font: string) {
  const fontSelect = page.locator('div', { has: page.locator('label', { hasText: 'Font:' }) }).locator('.c-select').last();

  await fontSelect.locator('.c-select-input').click();
  await fontSelect.getByPlaceholder('Search...').fill(font);
  await fontSelect.locator('.c-select-dropdown-option', { hasText: new RegExp(`^\\s*${font}\\s*$`) }).click();
}

async function expectArt(page: Page, font: string) {
  await expect.poll(() => output(page).textContent()).toBe(render(font));
}

test.describe('Tool - ASCII text drawer', () => {
  test('Has correct title', async ({ page }) => {
    await page.goto('/ascii-text-drawer');

    await expect(page).toHaveTitle('ASCII Art Text Generator - IT Tools');
  });

  test('Renders the default font with external requests blocked and no font download (#39)', async ({ page, baseURL }) => {
    const origin = new URL(baseURL!).origin;
    const fontRequests: string[] = [];

    await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    page.on('request', (request) => {
      if (request.url().includes('/figlet-fonts/')) {
        fontRequests.push(request.url());
      }
    });

    await page.goto('/ascii-text-drawer');

    await expectArt(page, 'Standard');
    expect(fontRequests).toEqual([]);
  });

  test('Loads another font on demand and re-renders', async ({ page }) => {
    await page.goto('/ascii-text-drawer');
    await expectArt(page, 'Standard');

    await selectFont(page, 'Banner3');

    await expectArt(page, 'Banner3');
  });

  test('A slow font that finishes late does not overwrite a newer selection', async ({ page }) => {
    let releaseBanner3!: () => void;
    const banner3Released = new Promise<void>(resolve => releaseBanner3 = resolve);

    // Resolves one task after the late Banner3 module has executed, by which time
    // every microtask it queued (font registration, the superseded watcher run and
    // Vue's re-render) has settled.
    await page.addInitScript(() => {
      (window as TestWindow).banner3Settled = new Promise(resolve =>
        window.addEventListener('banner3-evaluated', () => setTimeout(resolve, 0), { once: true }));
    });

    // Hold Banner3 back, then serve its whole body at once, tagged so the test
    // knows when the module has run.
    await page.route('**/figlet-fonts/Banner3-*.js', async (route) => {
      const response = await route.fetch();
      const body = `${await response.text()}\nwindow.dispatchEvent(new Event('banner3-evaluated'));`;
      await banner3Released;
      await route.fulfill({ response, body });
    });

    await page.goto('/ascii-text-drawer');
    await expectArt(page, 'Standard');

    await selectFont(page, 'Banner3');
    await expect(page.getByText('Loading font...')).toBeVisible();
    await selectFont(page, 'Slant');
    await expectArt(page, 'Slant');

    releaseBanner3();
    await page.evaluate(() => (window as TestWindow).banner3Settled);

    await expect(page.getByText('Loading font...')).toBeHidden();
    await expect(page.locator('.c-alert')).toBeHidden();
    expect(await output(page).textContent()).toBe(render('Slant'));
  });

  test('Offline, downloaded fonts still render and others explain why, then recover after a reload', async ({ page, context }) => {
    await page.goto('/ascii-text-drawer');
    await selectFont(page, 'Banner3');
    await expectArt(page, 'Banner3');

    await context.setOffline(true);

    await selectFont(page, 'Slant');
    await expect(page.getByText('Could not download the "Slant" font.')).toBeVisible();

    await selectFont(page, 'Banner3');
    await expectArt(page, 'Banner3');

    await selectFont(page, 'Standard');
    await expectArt(page, 'Standard');

    await selectFont(page, 'Slant');
    await expect(page.getByText('Could not download the "Slant" font.')).toBeVisible();

    // Some browsers remember the failed import until the page reloads, so the
    // error offers a reload; the selected font is restored from storage.
    await context.setOffline(false);
    await page.getByRole('button', { name: 'Reload page' }).click();

    await expectArt(page, 'Slant');
  });
});
