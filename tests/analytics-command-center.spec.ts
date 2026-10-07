import { test, expect } from '@playwright/test'

test.describe('Ghana Analytics & Realtime Incident Command Center', () => {
  test('Staff analyst logs in, accesses /admin/analytics, and interacts with map & feed', async ({
    page,
  }) => {
    // 1. Sign in as Analyst
    await page.goto('/auth/admin-login')
    await page.locator('input[name="email"]').fill('analyst1@safevoice.test')
    await page.locator('input[name="password"]').fill('00000000')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 })
    await expect(page.getByText('Active Cases').first()).toBeVisible({ timeout: 15000 })

    // 2. Navigate to Analytics page via sidebar navigation
    await page.getByRole('link', { name: /Analytics & Map/i }).click()
    await expect(page).toHaveURL(/\/admin\/analytics/, { timeout: 15000 })

    // 3. Verify Executive KPI Bar
    await expect(page.getByText('Total Incidents')).toBeVisible()
    await expect(page.getByText('Awaiting Triage')).toBeVisible()
    await expect(page.getByText('Assignment Rate')).toBeVisible()
    await expect(page.getByText('Median Response')).toBeVisible()

    // 4. Verify Ghana Regional Map renders with 16 regions
    await expect(page.getByText('Ghana Regional Incident Command Map')).toBeVisible()
    await expect(page.getByText('Greater Accra').first()).toBeVisible()
    await expect(page.getByText('Ashanti').first()).toBeVisible()
    await expect(page.getByText('Northern').first()).toBeVisible()

    // 5. Verify Realtime Dispatch Feed
    await expect(page.getByText('Realtime Dispatch Feed')).toBeVisible()
    await expect(page.getByText(/SV-\d{4}-\d{4}/).first()).toBeVisible()

    // 6. Test Manual Simulation Injection Trigger
    const simulateButton = page.getByRole('button', { name: /Simulate Live Ping/i })
    await expect(simulateButton).toBeVisible()
    await simulateButton.click()

    // 7. Verify Deep Analytics Charts
    await expect(page.getByText('Incident Breakdown by Category')).toBeVisible()
    await expect(page.getByText('Regional Incident Load (16 Regions)')).toBeVisible()
    await expect(page.getByText('7-Day Ingestion vs. Caseworker Triage Curve')).toBeVisible()
    await expect(page.getByText('Triage Pipeline & SLA Health')).toBeVisible()
  })
})
