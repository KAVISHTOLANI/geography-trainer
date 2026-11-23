import { expect, test } from '@playwright/test';
import { checkMobile, snap } from './helpers';

test('quiz, map, reference, history', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Know the world');
  await expect(page.locator('.hero .dotmap svg')).toBeVisible();
  await page.waitForTimeout(1200);
  await snap(page, 'landing');
  await checkMobile(page, 'landing-mobile');

  await page.getByRole('link', { name: 'Start a quiz' }).first().click();
  await page.getByLabel('Continent', { exact: true }).selectOption('Europe');
  await page.getByLabel('Questions', { exact: true }).selectOption('5');
  await page.getByRole('button', { name: /Start 5 questions/ }).click();
  for (let i = 0; i < 5; i++) {
    await page.locator('.opt').first().click();
    await expect(page.getByRole('status')).toBeVisible();
    if (i === 0) { await snap(page, 'quiz'); await checkMobile(page); }
    await page.getByRole('button', { name: i === 4 ? 'See results' : 'Next →' }).click();
  }
  await expect(page.getByRole('heading', { level: 1 })).toContainText('out of 5');
  await snap(page, 'results');

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Map' }).click();
  await page.getByLabel('From', { exact: true }).selectOption('Brazil');
  await page.getByLabel('To', { exact: true }).selectOption('Kenya');
  await expect(page.getByTestId('distance')).toContainText('km');
  await snap(page, 'map');

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'History' }).click();
  await expect(page.getByText('Rounds', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('.stat-value').first()).toHaveText('6');
  await page.waitForTimeout(800);
  await snap(page, 'history');
  await checkMobile(page, 'history-mobile');
});
