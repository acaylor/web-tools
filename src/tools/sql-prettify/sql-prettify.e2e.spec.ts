import { expect, test } from '@playwright/test';

test.describe('Tool - SQL prettify', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sql-prettify');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('SQL prettify and format - IT Tools');
  });

  test('Formats the default query with uppercased keywords on separate lines', async ({ page }) => {
    const formattedSql = (await page.getByTestId('area-content').innerText()).trim();

    expect(formattedSql).toContain('SELECT');
    expect(formattedSql).toContain('FROM');
    expect(formattedSql).toContain('WHERE');
    // lowercase input keywords must be re-cased, not left as-is
    expect(formattedSql).not.toContain('select ');
    // fields should be broken onto their own indented lines
    expect(formattedSql).toContain('  field1,');
  });

  test('Re-formats a custom query', async ({ page }) => {
    await page.getByPlaceholder('Put your SQL query here...').fill('select 1');

    const formattedSql = (await page.getByTestId('area-content').innerText()).trim();

    expect(formattedSql).toContain('SELECT');
    expect(formattedSql).toContain('1');
  });
});
