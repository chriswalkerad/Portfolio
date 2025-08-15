import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('home renders and UI basic flow', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Title of episode/i })).toBeVisible();

    await page.getByRole('button', { name: /^Text$/ }).click();
    await page.getByRole('menuitem', { name: /Normal text/i }).click();

    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();

    await expect(page.locator('div').filter({ hasText: 'Normal text' }).first()).toBeVisible();
  });
});
