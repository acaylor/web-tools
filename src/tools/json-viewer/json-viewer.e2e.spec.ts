import { expect, test } from '@playwright/test';

test.describe('Tool - JSON viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/json-prettify');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('JSON prettify and format - IT Tools');
  });

  test('Prettifies pasted JSON', async ({ page }) => {
    const input = page.getByPlaceholder('Paste your raw JSON here...');
    await input.fill('');
    await input.fill('{"b":2,"a":[1,2,{"k":"v"}]}');

    const pretty = await page.getByTestId('area-content').innerText();

    expect(pretty.trim()).toEqual(
      `
{
   "a": [
      1,
      2,
      {
         "k": "v"
      }
   ],
   "b": 2
}`.trim(),
    );
  });

  test('Tolerates an emptied input without throwing', async ({ page }) => {
    // Reproduces the null-guard path in the validator after the v6/strict types change:
    // the rule receives `undefined` when storage is cleared.
    const input = page.getByPlaceholder('Paste your raw JSON here...');
    await input.fill('');
    await expect(input).toHaveValue('');
    // No validation error should be shown for an empty input.
    await expect(page.getByText('Provided JSON is not valid.')).not.toBeVisible();
  });
});
