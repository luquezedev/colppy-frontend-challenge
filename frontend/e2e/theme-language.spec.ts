import { test, expect } from '@playwright/test';

test.describe('Theme and Language Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[class*="metric-card"]');
  });

  test.describe('Theme Toggle', () => {
    test('should toggle between light and dark theme', async ({ page }) => {
      // Check initial theme (should be light by default)
      const html = page.locator('html');
      await expect(html).not.toHaveClass(/dark/);

      // Click theme toggle button
      await page.click('button[aria-label="Theme"]');

      // Check that dark theme is applied
      await expect(html).toHaveClass(/dark/);

      // Toggle back to light
      await page.click('button[aria-label="Theme"]');
      await expect(html).not.toHaveClass(/dark/);
    });

    test('should persist theme preference in localStorage', async ({ page }) => {
      // Switch to dark theme
      await page.click('button[aria-label="Theme"]');

      // Check localStorage
      const theme = await page.evaluate(() => localStorage.getItem('app-theme'));
      expect(theme).toBe('dark');

      // Reload page
      await page.reload();

      // Theme should still be dark
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    });

    test('should update chart colors in dark mode', async ({ page }) => {
      // Switch to dark theme
      await page.click('button[aria-label="Theme"]');

      // Wait for charts to update
      await page.waitForTimeout(500);

      // Check if Highcharts background has been updated
      const chartBackground = page.locator('.highcharts-background').first();
      const fill = await chartBackground.getAttribute('fill');

      // In dark mode, the background should be dark
      expect(fill).toBe('#1e293b');
    });
  });

  test.describe('Language Selector', () => {
    test('should display language dropdown on click', async ({ page }) => {
      // Click language selector button
      await page.click('button[aria-label="Language"]');

      // Check that dropdown is visible
      await expect(page.locator('text=English')).toBeVisible();
      await expect(page.locator('text=Español')).toBeVisible();
      await expect(page.locator('text=Português')).toBeVisible();
      await expect(page.locator('text=Français')).toBeVisible();
    });

    test('should switch to Spanish', async ({ page }) => {
      // Click language selector
      await page.click('button[aria-label="Language"]');

      // Select Spanish
      await page.click('text=Español');

      // Check that UI is translated
      await expect(page.locator('h1')).toContainText('Panel de Métricas');
      await expect(page.locator('text=Usuarios Activos')).toBeVisible();
      await expect(page.locator('text=Ingresos')).toBeVisible();
    });

    test('should persist language preference', async ({ page }) => {
      // Switch to Portuguese
      await page.click('button[aria-label="Language"]');
      await page.click('text=Português');

      // Check localStorage
      const language = await page.evaluate(() => localStorage.getItem('i18nextLng'));
      expect(language).toBe('pt');

      // Reload page
      await page.reload();

      // Language should still be Portuguese
      await expect(page.locator('h1')).toContainText('Painel de Métricas');
    });

    test('should translate chart titles', async ({ page }) => {
      // Switch to French
      await page.click('button[aria-label="Language"]');
      await page.click('text=Français');

      // Check chart titles are translated
      await expect(page.locator('text=Évolution Temporelle')).toBeVisible();
      await expect(page.locator('text=Répartition Régionale')).toBeVisible();
    });

    test('should translate alerts', async ({ page }) => {
      // Switch to German
      await page.click('button[aria-label="Language"]');
      await page.click('text=Deutsch');

      // Wait for potential alerts
      await page.waitForTimeout(2000);

      // If alerts exist, check they're translated
      const alerts = page.locator('[class*="alert"]');
      const alertCount = await alerts.count();

      if (alertCount > 0) {
        const alertText = await alerts.first().textContent();
        expect(alertText).toMatch(/Warnung|Kritisch/);
      }
    });
  });

  test.describe('Mobile Menu', () => {
    test('should show mobile menu on small screens', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Mobile menu button should be visible
      const mobileMenuButton = page.locator('button[aria-label="Toggle mobile menu"]');
      await expect(mobileMenuButton).toBeVisible();

      // Click to open mobile menu
      await mobileMenuButton.click();

      // Mobile menu should be visible with language and theme options
      await expect(page.locator('text=Theme')).toBeVisible();

      // Language flags should be visible in grid
      const flags = page.locator('.grid-cols-3').locator('button');
      const flagCount = await flags.count();
      expect(flagCount).toBeGreaterThan(0);
    });

    test('should switch theme from mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      await page.click('button[aria-label="Toggle mobile menu"]');

      // Click theme toggle in mobile menu
      await page.click('.w-full:has-text("Theme")');

      // Check that theme changed
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    });

    test('should switch language from mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      await page.click('button[aria-label="Toggle mobile menu"]');

      // Click on Spanish flag/button (ES)
      await page.click('button:has-text("ES")');

      // Check that language changed
      await expect(page.locator('h1')).toContainText('Panel de Métricas');
    });
  });
});

test.describe('Responsive Layout', () => {
  test('should adapt layout for mobile devices', async ({ page }) => {
    await page.goto('/');

    // Desktop view - cards in grid
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForSelector('[class*="metric-card"]');

    // Check grid layout on desktop (should be 4 columns)
    const desktopGrid = page.locator('.dashboard-grid');
    await expect(desktopGrid).toHaveClass(/xl:grid-cols-4/);

    // Mobile view - cards stacked
    await page.setViewportSize({ width: 375, height: 667 });

    // On mobile, grid should be single column
    await expect(desktopGrid).toHaveClass(/grid-cols-1/);
  });

  test('should hide chart legends on mobile', async ({ page }) => {
    await page.goto('/');

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for charts to load and responsive rules to apply
    await page.waitForSelector('.highcharts-container');
    await page.waitForTimeout(1000);

    // Legend should be hidden on mobile (based on responsive rules)
    const legend = page.locator('.highcharts-legend');
    const isLegendVisible = await legend.isVisible().catch(() => false);

    // Legend might be hidden or not present due to responsive rules
    expect(isLegendVisible).toBeFalsy();
  });

  test('should stack chart containers on tablet', async ({ page }) => {
    await page.goto('/');

    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Wait for layout to adjust
    await page.waitForSelector('.chart-grid');

    // Charts should be in single column on tablet
    const chartGrid = page.locator('.chart-grid');
    await expect(chartGrid).toHaveClass(/grid-cols-1/);
  });
});