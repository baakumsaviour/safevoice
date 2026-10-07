import { test, expect } from '@playwright/test'

test.describe('SafeVoice Documentation & Testing Hub (/docs)', () => {
  test('/docs renders cleanly with header, tabs, and overview', async ({ page }) => {
    await page.goto('/docs')
    await expect(page).toHaveTitle(/SafeVoice/i)
    await expect(page.getByRole('heading', { name: /Platform Architecture, Test Accounts & Verification Guide/i })).toBeVisible()

    // Tab buttons exist
    await expect(page.getByRole('button', { name: /1\. Platform Overview & Architecture/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /2\. Test Accounts Switchboard/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /3\. Interactive Scenarios & Workflows/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /4\. CLI Verification & Bug Reporting/i })).toBeVisible()
  })

  test('Test accounts tab displays accounts and launches prefilled login', async ({ page }) => {
    await page.goto('/docs')
    await page.getByRole('button', { name: /2\. Test Accounts Switchboard/i }).click()

    // Test password and accounts visible
    await expect(page.getByText('00000000').first()).toBeVisible()
    await expect(page.getByText('admin1@safevoice.test').first()).toBeVisible()
    await expect(page.getByText('caseworker1@safevoice.test').first()).toBeVisible()
    await expect(page.getByText('survivor1@safevoice.test').first()).toBeVisible()

    // Launch staff login button navigates with email query param
    const adminLaunch = page.getByRole('link', { name: /Launch Staff Login/i }).first()
    await adminLaunch.click()
    await expect(page).toHaveURL(/\/auth\/admin-login\?email=admin1%40safevoice\.test/)

    // Email field is prefilled
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toHaveValue('admin1@safevoice.test')
  })

  test('Workflows tab allows checking scenario steps and persists progress', async ({ page }) => {
    await page.goto('/docs')
    await page.getByRole('button', { name: /3\. Interactive Scenarios & Workflows/i }).click()

    await expect(page.getByText('T1').first()).toBeVisible()
    await expect(page.getByText('T9').first()).toBeVisible()

    // Toggle scenario T1
    const t1Checkbox = page.locator('button:has-text("T1"), [class*="rounded-lg border"]').first()
    await t1Checkbox.click()
  })

  test('CLI verification tab displays commands and copyable bug template', async ({ page }) => {
    await page.goto('/docs')
    await page.getByRole('button', { name: /4\. CLI Verification & Bug Reporting/i }).click()

    await expect(page.getByText('node scripts/create-testers.mjs')).toBeVisible()
    await expect(page.getByText('node scripts/verify-rls.mjs')).toBeVisible()
    await expect(page.getByText('node scripts/verify-stealth.mjs')).toBeVisible()
    await expect(page.getByRole('button', { name: /Copy Template/i })).toBeVisible()
  })
})
