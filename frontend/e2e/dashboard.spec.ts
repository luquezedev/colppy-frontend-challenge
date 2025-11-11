import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the dashboard header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Metrics Dashboard');
  });

  test('should display KPI cards', async ({ page }) => {
    // Wait for KPI cards to load
    await page.waitForSelector('[class*="metric-card"]');

    // Check for all 4 KPI cards
    const kpiCards = page.locator('[class*="metric-card"]');
    await expect(kpiCards).toHaveCount(4);

    // Check for specific metrics
    await expect(page.locator('text=Active Users')).toBeVisible();
    await expect(page.locator('text=Revenue')).toBeVisible();
    await expect(page.locator('text=Churn Rate')).toBeVisible();
    await expect(page.locator('text=Conversion Rate')).toBeVisible();
  });

  test('should auto-refresh every 5 seconds', async ({ page }) => {
    // Get initial value of a metric
    await page.waitForSelector('[class*="metric-value"]');
    const initialValue = await page.locator('[class*="metric-value"]').first().textContent();

    // Wait for 6 seconds (slightly more than refresh interval)
    await page.waitForTimeout(6000);

    // Check if value has changed
    const updatedValue = await page.locator('[class*="metric-value"]').first().textContent();
    expect(initialValue).not.toBe(updatedValue);
  });

  test('should display threshold alerts when limits are exceeded', async ({ page }) => {
    // Wait for potential alerts to appear
    await page.waitForTimeout(2000);

    // Check if any alert exists (depends on random data)
    const alerts = page.locator('[class*="alert"]');
    const alertCount = await alerts.count();

    if (alertCount > 0) {
      // If alerts exist, verify they have proper structure
      const firstAlert = alerts.first();
      await expect(firstAlert).toContainText(/threshold|warning|critical/i);
    }
  });

  test('should handle manual refresh', async ({ page }) => {
    // Click refresh button
    await page.click('button:has-text("Refresh")');

    // Check for loading state or updated timestamp
    await expect(page.locator('text=Last updated')).toBeVisible();
  });

  test('should export data to CSV', async ({ page }) => {
    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.click('button:has-text("Export")');

    // Wait for download to complete
    const download = await downloadPromise;

    // Verify the download
    expect(download.suggestedFilename()).toMatch(/metrics-export.*\.csv/);
  });

  test('should display charts', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('.highcharts-container', { timeout: 10000 });

    // Check for both charts
    const charts = page.locator('.highcharts-container');
    await expect(charts).toHaveCount(2);

    // Check for chart titles
    await expect(page.locator('text=Time Evolution')).toBeVisible();
    await expect(page.locator('text=Regional Breakdown')).toBeVisible();
  });

  test('should show loading state on initial load', async ({ page }) => {
    // Navigate to the page and immediately check for loading state
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Check if loading indicator appears (might be very quick)
    const loadingIndicator = page.locator('text=Loading dashboard');
    const isLoadingVisible = await loadingIndicator.isVisible().catch(() => false);

    // If loading is visible, wait for it to disappear
    if (isLoadingVisible) {
      await expect(loadingIndicator).toBeHidden({ timeout: 10000 });
    }

    // Dashboard should be loaded
    await expect(page.locator('[class*="metric-card"]')).toHaveCount(4);
  });

  test('should handle API errors gracefully', async ({ page, context }) => {
    // Block API requests to simulate error
    await context.route('**/metrics', route => route.abort());

    // Navigate to page
    await page.goto('/');

    // Check for error state
    await expect(page.locator('text=Error loading dashboard')).toBeVisible();
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();

    // Click retry (will still fail but tests the button exists)
    await page.click('button:has-text("Retry")');
  });

  test('should display summary statistics', async ({ page }) => {
    // Scroll to bottom to see summary
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for summary section
    await page.waitForSelector('text=Summary Statistics', { timeout: 5000 });

    // Check for summary metrics
    await expect(page.locator('text=Average Active Users')).toBeVisible();
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Avg Conversion Rate')).toBeVisible();
    await expect(page.locator('text=Top Region')).toBeVisible();
  });
});