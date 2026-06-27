import { test } from '@playwright/test';

test('verify layout improvements', async ({ page }) => {
  await page.goto('http://localhost:8080/dashboard/gtpayout/trading');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'manual_trading_fullwidth.png' });

  await page.goto('http://localhost:8080/dashboard/gtpayout/bot');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'bot_trading_fullwidth.png' });

  await page.goto('http://localhost:8080/dashboard');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'overview_fullwidth.png' });
});
