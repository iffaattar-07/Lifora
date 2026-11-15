import { test, expect } from '@playwright/test';

test.describe('Senior User Journey (Margaret Vance)', () => {
  test('complete flow: landing page -> demo login -> senior dashboard -> medication interaction', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');
    await expect(page).toHaveTitle(/Lifora/i);

    // Verify official tagline
    const tagline = page.locator('text=healthier, together.');
    await expect(tagline).toBeVisible();

    // 2. Open Demo Login Modal
    const exploreBtn = page.getByRole('button', { name: /Explore Demo Accounts/i });
    await exploreBtn.click();

    // Verify modal appears
    await expect(page.getByText('Sign In to LIFORA')).toBeVisible();
    await expect(page.getByText('Margaret Vance')).toBeVisible();

    // 3. Auto-fill & Log In as Senior
    const autoFillBtn = page.getByRole('button', { name: /Auto-fill & Log In/i }).first();
    await autoFillBtn.click();

    // 4. Verify Senior Dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.getByText(/Margaret/i).first()).toBeVisible();
    await expect(page.getByText(/My Medicine/i)).toBeVisible();

    // 5. Check Next Dose Card
    const nextDose = page.locator('text=Lisinopril').first();
    await expect(nextDose).toBeVisible();

    // 6. Test Interactive Clinical Safeguard in Assistant
    await page.goto('/assistant');
    await expect(page.getByPlaceholder(/Ask about medications|Ask Lifora/i)).toBeVisible();
  });
});
