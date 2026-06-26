import { test, expect } from '@playwright/test';

test('final verification', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'final_landing.png' });

  // Try to access dashboard (mocking localStorage might be needed if it redirects)
  await page.evaluate(() => {
    localStorage.setItem('user_id', '1');
    localStorage.setItem('user_name', 'Test User');
  });

  await page.goto('http://localhost:5173/dashboard/gtpayout');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'final_gtpayout_overview.png' });
});
