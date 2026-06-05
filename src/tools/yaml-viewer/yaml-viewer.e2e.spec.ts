import { expect, test } from '@playwright/test';

test.describe('Tool - YAML viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/yaml-prettify');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('YAML prettify and format - IT Tools');
  });

  test('Prettifies pasted YAML', async ({ page }) => {
    const input = page.getByPlaceholder('Paste your raw YAML here...');
    await input.fill('foo: bar\nlist:\n  - one\n  - two\n');

    const pretty = await page.getByTestId('area-content').innerText();

    // The yaml lib re-emits with the configured indent (2). We just assert it
    // round-trips the structure rather than pinning every byte.
    expect(pretty).toContain('foo: bar');
    expect(pretty).toContain('- one');
    expect(pretty).toContain('- two');
  });

  test('Tolerates an emptied input without throwing', async ({ page }) => {
    const input = page.getByPlaceholder('Paste your raw YAML here...');
    await input.fill('');
    await expect(input).toHaveValue('');
    await expect(page.getByText('Provided YAML is not valid.')).not.toBeVisible();
  });
});
