import { test, expect } from '@playwright/test';

test.describe('Caregiver User Journey (Sarah Vance)', () => {
  test('complete flow: landing page -> demo login -> caregiver dashboard -> monitoring & coordination', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');

    // 2. Open Demo Login Modal
    const exploreBtn = page.getByRole('button', { name: /Explore Demo Accounts/i });
    await exploreBtn.click();

    // 3. Select Caregiver Persona (Sarah Vance)
    const sarahPersona = page.getByText('Sarah Vance').first();
    await sarahPersona.click();

    // Verify caregiver credentials auto-filled
    await expect(page.getByDisplayValue('sarah@lifora.demo')).toBeVisible();

    // 4. Quick Log In
    const autoFillBtn = page.getByRole('button', { name: /Auto-fill & Log In/i }).nth(1);
    await autoFillBtn.click();

    // 5. Verify Caregiver Dashboard Loaded
    await page.waitForURL('**/dashboard');
    await expect(page.getByText(/Family & Caregiver View/i)).toBeVisible();
    await expect(page.getByText(/Sarah/i).first()).toBeVisible();

    // 6. Verify Care Recipient Vitals
    await expect(page.getByText(/Margaret Vance/i).first()).toBeVisible();
    await expect(page.getByText(/Adherence/i).first()).toBeVisible();

    // 7. Check Medications Monitoring
    await page.goto('/medications');
    await expect(page.getByText(/Lisinopril/i).first()).toBeVisible();
  });
});
