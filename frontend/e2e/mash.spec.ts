import { test, expect } from '@playwright/test';

// Ensure the hero letters and Start button render on load.
test('landing renders hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('chip-M')).toBeVisible();
  await expect(page.getByTestId('chip-A')).toBeVisible();
  await expect(page.getByTestId('chip-S')).toBeVisible();
  await expect(page.getByTestId('chip-H')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
});

// Enter the form, type, then clear and verify the input resets.
test('start reveals form and clear resets inputs', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText('Choose your options before we spin the wheel of fate.')).toBeVisible();

  const partnerFirstInput = page.locator('input[id^="partner-"]').first();
  await partnerFirstInput.fill('Test Partner');
  await expect(partnerFirstInput).toHaveValue('Test Partner');

  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(partnerFirstInput).toHaveValue('');
});

// Toggle music on/off and back to on via the UI label.
test('music toggle switches labels', async ({ page }) => {
  await page.goto('/');
  const musicBtn = page.getByRole('button', { name: 'Music on' });
  await expect(musicBtn).toBeVisible();
  await musicBtn.click();
  await expect(page.getByRole('button', { name: 'Music off' })).toBeVisible();
  await page.getByRole('button', { name: 'Music off' }).click();
  await expect(page.getByRole('button', { name: 'Music on' })).toBeVisible();
});

// Confirm the intro glow stops after Start and the music toggle remains.
test('start stops intro glow and keeps music toggle visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.chip--active')).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.locator('.chip--active')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Music (on|off)/ })).toBeVisible();
});

// Verify form lead text and spin placeholder match constants.
test('form text matches constants and spin placeholder shows', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText('Choose your options before we spin the wheel of fate.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Spin wheel (coming soon)' })).toBeVisible();
});

// Check the hero header disappears after Start and inline title appears.
test('start hides intro header and shows inline title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero')).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.locator('.hero')).toHaveCount(0);
  await expect(page.getByTestId('chip-inline-M')).toBeVisible();
});
