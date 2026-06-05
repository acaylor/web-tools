import { expect, test } from '@playwright/test';

// TEMPORARY diagnostic: capture the real browser runtime error behind the e2e timeouts.
for (const path of ['/', '/color-converter']) {
  test(`diag: capture runtime errors on ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => {
      errors.push(`PAGEERROR: ${e.message}\n${e.stack ?? ''}`);
    });
    page.on('console', (m) => {
      if (m.type() === 'error') {
        errors.push(`CONSOLE.ERROR: ${m.text()}`);
      }
    });
    page.on('requestfailed', (r) => {
      errors.push(`REQFAILED: ${r.url()} ${r.failure()?.errorText ?? ''}`);
    });

    await page.goto(path, { waitUntil: 'load' }).catch((e) => {
      errors.push(`GOTO_FAIL: ${e.message}`);
    });
    await page.waitForTimeout(4000);

    const appHtml = await page.locator('#app').innerHTML().catch(() => '(no #app)');
    const summary = [
      `PATH=${path}`,
      `APP_HTML_LEN=${appHtml.length}`,
      `APP_HTML_HEAD=${appHtml.slice(0, 400)}`,
      `--- CAPTURED (${errors.length}) ---`,
      ...errors,
    ].join('\n');

    expect(errors, summary).toEqual([]);
  });
}
