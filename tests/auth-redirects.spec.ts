import { test, expect } from '@playwright/test';

test('anonymous visitors are redirected away from staff routes to staff portal', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/auth\/admin-login/);

  await page.goto('/admin/analytics');
  await expect(page).toHaveURL(/\/auth\/admin-login/);

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth\/login/);
});

test('public navbar does not display a prominent login/signup button to avoid discouraging survivors', async ({ page }) => {
  await page.goto('/');
  // Header should not have prominent "Login / Sign Up" button
  const header = page.locator('header');
  await expect(header.getByRole('button', { name: /login/i })).toHaveCount(0);
  await expect(header.getByRole('button', { name: /sign up/i })).toHaveCount(0);
  // Quick escape and stealth buttons are present
  await expect(header.getByRole('button', { name: /leave site/i })).toBeVisible();
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
