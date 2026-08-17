import { test, expect } from '@playwright/test';

test('report round-trip: anonymous submission → admin reads decrypted narrative and replies', async ({ browser }) => {
  test.setTimeout(120000);
  const marker = `E2E-${Date.now()}`;
  const narrative = `${marker} An incident happened near the market and I need help documenting it.`;

  // --- Victim: anonymous report ---
  const victimCtx = await browser.newContext();
  const victim = await victimCtx.newPage();
  await victim.goto('/report');
  await victim.getByRole('button', { name: /Domestic Violence/ }).click();
  await victim.getByRole('button', { name: /Next: Incident Details/ }).click();
  await victim.getByPlaceholder(/I want to report an incident involving/).fill(narrative);
  await victim.getByRole('button', { name: /Next: Attach Evidence/ }).click();
  await victim.getByRole('button', { name: /Next: Review & Submit/ }).click();
  await victim.getByRole('button', { name: /Submit Secure Report/ }).click();
  await expect(victim.locator('h2').filter({ hasText: 'Report Submitted Safely' })).toBeVisible({ timeout: 15000 });
  const caseNumber = (await victim.locator('code').first().textContent())?.trim();
  expect(caseNumber).toMatch(/SV-[A-Z2-9]{4}-[A-Z2-9]{4}/);
  await victimCtx.close();

  // --- Admin: sees the case, opens it, reads the DECRYPTED narrative ---
  const adminCtx = await browser.newContext();
  const admin = await adminCtx.newPage();
  await admin.goto('/auth/login');
  await admin.locator('input[name="email"]').fill('admin@safevoice.local');
  await admin.locator('input[name="password"]').fill('password123');
  await admin.getByRole('button', { name: /sign in/i }).click();
  await expect(admin).toHaveURL(/\/admin/, { timeout: 15000 });

  await expect(admin.getByText(caseNumber!)).toBeVisible({ timeout: 15000 });
  await admin.goto(`/admin/cases/${caseNumber}`);

  // The narrative is stored AES-encrypted; seeing the plaintext here proves
  // the server-side decrypt path works for authorized staff.
  await expect(admin.getByText(narrative)).toBeVisible({ timeout: 15000 });

  // Staff reply lands in the thread
  await admin.getByPlaceholder('Type a secure message...').fill('Hello, a caseworker here. You are not alone.');
  await admin.getByPlaceholder('Type a secure message...').press('Enter');
  await expect(admin.getByText('You are not alone.').last()).toBeVisible({ timeout: 15000 });
  await adminCtx.close();
});
