import { test, expect } from '@playwright/test';

test('submit an anonymous report through the 4-step wizard', async ({ page }) => {
  await page.goto('/report');

  await expect(page.locator('h1').filter({ hasText: 'Submit a Report' })).toBeVisible();

  // Step 1: pick an incident category
  await page.getByRole('button', { name: /Harassment & Stalking/ }).click();
  await page.getByRole('button', { name: /Next: Incident Details/ }).click();

  // Step 2: narrative + optional details
  await page
    .getByPlaceholder(/I want to report an incident involving/)
    .fill('This is a test report narrative providing more than 10 characters to satisfy validation.');
  await page.getByRole('button', { name: /Next: Attach Evidence/ }).click();

  // Step 3: no files
  await page.getByRole('button', { name: /Next: Review & Submit/ }).click();

  // Step 4: contact + consent (checked by default) + submit
  await page.getByPlaceholder('Phone number, WhatsApp, or secure email').fill('test-e2e-user@example.com');
  await page.getByRole('button', { name: /Submit Secure Report/ }).click();

  await expect(page.locator('h2').filter({ hasText: 'Report Submitted Safely' })).toBeVisible({ timeout: 15000 });

  // Case reference in the new format SV-XXXX-XXXX
  await expect(page.locator('code').filter({ hasText: /SV-[A-Z2-9]{4}-[A-Z2-9]{4}/ })).toBeVisible();
});

test('report submission is blocked without a narrative', async ({ page }) => {
  await page.goto('/report');
  await page.getByRole('button', { name: /Next: Incident Details/ }).click();
  await page.getByRole('button', { name: /Next: Attach Evidence/ }).click();
  await expect(page.getByText(/at least 10 characters/)).toBeVisible();
});
