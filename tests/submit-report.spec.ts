import { test, expect } from '@playwright/test';

test('successfully submit a report and see success message', async ({ page }) => {
  // Go to the report page
  await page.goto('/report');

  // Verify we're on the right page
  await expect(page.locator('h1').filter({ hasText: 'Submit a Report' })).toBeVisible();

  // 1. Fill narrative
  await page.fill('textarea[name="narrative"]', 'This is a test report narrative providing more than 10 characters to satisfy validation.');

  // 2. Select case type
  await page.selectOption('select[name="case_type"]', 'harassment');

  // 3. Fill location and date
  await page.fill('input[name="incident_location"]', 'Test City Location');
  await page.fill('input[name="incident_date"]', '2026-06-30');

  // 4. Fill contact info
  await page.fill('input[name="contact_info"]', 'test-e2e-user@example.com');

  // Consent checkbox is default checked, but let's ensure it's checked
  const consentCheckbox = page.locator('input[name="consent_given"]');
  await expect(consentCheckbox).toBeChecked();

  // Submit the form
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // Wait for the success state
  // The success UI shows "Report Submitted Safely"
  const successHeading = page.locator('h2').filter({ hasText: 'Report Submitted Safely' });
  await expect(successHeading).toBeVisible({ timeout: 10000 }); // allow up to 10s for DB insertion

  // Check that a case number is displayed (CAS-XXXXXX)
  const caseNumberText = page.locator('p').filter({ hasText: /CAS-[A-Z0-9]{6}/ });
  await expect(caseNumberText).toBeVisible();
});
