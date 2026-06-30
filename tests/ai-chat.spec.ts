import { test, expect } from '@playwright/test';

test('simulate anonymous chat with AI', async ({ page }) => {
  // Set a longer timeout since we are hitting a real AI API
  test.setTimeout(60000);

  // 1. Go to the homepage where the chat is located
  await page.goto('/');

  // 2. Locate the chat input
  const chatInput = page.getByPlaceholder('Type your message here safely...');
  
  // 3. Type a message
  await chatInput.fill('Hello, I am testing the system. I need help.');

  // 4. Press Enter to send
  await chatInput.press('Enter');

  // 5. Verify the optimistic UI update (the user's message appears on the right)
  await expect(page.locator('div').filter({ hasText: 'Hello, I am testing the system. I need help.' }).first()).toBeVisible();

  // 6. Verify the system message indicating secure chat establishment
  await expect(page.locator('div').filter({ hasText: /Secure chat established\. Your anonymous Case Number is CAS-[A-Z0-9]{6}/ }).first()).toBeVisible({ timeout: 15000 });

  // 7. Wait for the AI's response via Supabase Realtime
  const aiHeader = page.locator('div').filter({ hasText: 'SafeVoice Assistant' }).last();
  await expect(aiHeader).toBeVisible({ timeout: 30000 });

  // Get the actual text of the AI's response (it's the next sibling div of the header)
  const aiMessageContainer = aiHeader.locator('xpath=following-sibling::div').first();
  const aiText = await aiMessageContainer.textContent();
  console.log('--- AI RESPONDED WITH ---');
  console.log(aiText);
  console.log('-------------------------');
});
