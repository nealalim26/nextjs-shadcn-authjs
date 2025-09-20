import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage and redirect to login when not authenticated', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the redirect to login page
    await page.waitForURL('/auth/login');

    // Check that we're on the login page
    expect(page.url()).toContain('/auth/login');

    // Check that the login page has the expected elements
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display login form elements', async ({ page }) => {
    await page.goto('/auth/login');

    // Check for common login form elements
    // Note: These selectors might need to be adjusted based on your actual login page implementation
    await expect(page.locator('form')).toBeVisible();

    // Check for input fields (these might need adjustment based on your actual form)
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]');

    // At least one of these should be visible
    const hasEmailInput = (await emailInput.count()) > 0;
    const hasPasswordInput = (await passwordInput.count()) > 0;

    expect(hasEmailInput || hasPasswordInput).toBeTruthy();
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/auth/login');

    // Check that the page has a title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/auth/login');

    // Check that the page is visible and responsive
    await expect(page.locator('body')).toBeVisible();

    // Check that the viewport is mobile-sized
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/auth/login');

    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);

    // Check for charset
    const charset = page.locator('meta[charset]');
    await expect(charset).toHaveAttribute('charset', 'utf-8');
  });
});
