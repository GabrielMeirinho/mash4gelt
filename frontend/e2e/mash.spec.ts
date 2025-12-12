import { test, expect } from '@playwright/test';

test('app renders', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/mash/i);
});