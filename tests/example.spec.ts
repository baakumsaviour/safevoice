import { test, expect } from '@playwright/test';

test('has title and UI elements load', async ({ page }) => {
  await page.goto('/');

  // Check if the SafeVoice title or some known element exists.
  // We'll just look for a generic role like heading or wait for the page to settle.
  const header = page.locator('h1').first();
  await expect(header).toBeVisible();
});
