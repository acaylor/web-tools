import { expect, test } from '@playwright/test';

// The About page is the main consumer of the <c-markdown> component, which renders
// its content through `marked`. These checks exercise the marked v18 upgrade: heading
// parsing and the custom link renderer override (which forces target/rel attributes).
test.describe('Page - About', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('Renders markdown headings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'About Web Tools' })).toBeVisible();
  });

  test('Renders markdown links through the custom renderer', async ({ page }) => {
    const link = page.getByRole('link', { name: 'it-tools' });

    await expect(link).toHaveAttribute('href', 'https://github.com/CorentinTh/it-tools');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener');
  });
});
