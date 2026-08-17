import { test, expect } from '@playwright/test';

test('anonymous visitors are redirected away from staff routes', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/auth\/login/);

  await page.goto('/admin/analytics');
  await expect(page).toHaveURL(/\/auth\/login/);

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth\/login/);
});

test('staff login lands on the admin dashboard', async ({ page }) => {
  await page.goto('/auth/login');
  await page.locator('input[name="email"]').fill('admin@safevoice.local');
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
  await expect(page.getByText('Active Cases').first()).toBeVisible();
});

test('staff cannot open the victim dashboard (bounced to /admin, no loop)', async ({ page }) => {
  await page.goto('/auth/login');
  await page.locator('input[name="email"]').fill('worker@safevoice.local');
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/admin/);
});
