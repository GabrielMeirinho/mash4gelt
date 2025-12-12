import { test, expect } from '@playwright/test';

test('landing renders hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('chip-M')).toBeVisible();
  await expect(page.getByTestId('chip-A')).toBeVisible();
  await expect(page.getByTestId('chip-S')).toBeVisible();
  await expect(page.getByTestId('chip-H')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
});
