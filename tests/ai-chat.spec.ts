import { test, expect } from '@playwright/test';

test('anonymous homepage chat creates a case and shows the thread', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('/');

  const chatInput = page.getByPlaceholder('Type your message here safely...');
  await chatInput.fill('Hello, I am testing the system. I need help.');
  await chatInput.press('Enter');

  // Optimistic echo of the visitor's message
  await expect(page.getByText('Hello, I am testing the system. I need help.').first()).toBeVisible();

  // Secure session established with the new case number format
  await expect(
    page.getByText(/Secure chat established\. Your anonymous Case Number is SV-[A-Z2-9]{4}-[A-Z2-9]{4}/)
  ).toBeVisible({ timeout: 15000 });
});

test('AI assistant replies in the anonymous chat', async ({ page }) => {
  test.setTimeout(90000);
  // Requires a funded Vercel AI Gateway account. Enable with AI_E2E=1.
  test.skip(process.env.AI_E2E !== '1', 'set AI_E2E=1 (and a funded AI_GATEWAY_API_KEY) to run');

  await page.goto('/');
  const chatInput = page.getByPlaceholder('Type your message here safely...');
  await chatInput.fill('I would like some support today please.');
  await chatInput.press('Enter');

  await expect(page.getByText(/Secure chat established/)).toBeVisible({ timeout: 15000 });

  // The AI reply arrives via realtime → server refetch. The welcome bubble is
  // also labelled "SafeVoice Assistant", so wait for a second one.
  await expect
    .poll(async () => page.getByText('SafeVoice Assistant').count(), { timeout: 45000 })
    .toBeGreaterThan(1);
});
