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
  const musicBtn = page.getByRole('button', { name: /Music off/i });
  await expect(musicBtn).toBeVisible();
  await musicBtn.click();
  await expect(page.getByRole('button', { name: /Music on/i })).toBeVisible();
  await page.getByRole('button', { name: /Music on/i }).click();
  await expect(page.getByRole('button', { name: /Music off/i })).toBeVisible();
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
  await expect(page.getByRole('button', { name: 'Spin wheel' })).toBeVisible();
});

// Check the hero header disappears after Start and inline title appears.
test('start hides intro header and shows inline title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero')).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.locator('.hero')).toHaveCount(0);
  await expect(page.getByTestId('chip-inline-M')).toBeVisible();
});

// Ensure the spin step overlay shows and changes between runs (no repeat back-to-back).
test('spin step overlay shows and picks a different step on next run', async ({ page }) => {
  test.setTimeout(45000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();

  const spinAndCaptureStep = async () => {
    await page.getByRole('button', { name: 'Spin wheel' }).click();
    const bubble = page.locator('.step-overlay__bubble');
    await bubble.waitFor({ state: 'visible', timeout: 9000 });
    const raw = await bubble.textContent();
    expect(raw).not.toBeNull();
    const text = raw!.trim();
    await page.getByRole('button', { name: 'Start again' }).waitFor({ timeout: 30000 });
    return text;
  };

  const first = await spinAndCaptureStep();
  await page.getByRole('button', { name: 'Start again' }).click();

  const second = await spinAndCaptureStep();
  expect(first).not.toBe(second);
});
