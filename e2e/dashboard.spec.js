import { expect, test } from '@playwright/test';
import { liveSheetCsv } from '../src/test/fixtures';

const sheetPattern = '**/1Vi9p0S4sXv_Wr_d3bSFLx8WGeNmH-y7HeLl9QqV77oY/export?format=csv';

test('renders the dashboard with sheet-backed data and no page crashes', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.route(sheetPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/csv',
      body: liveSheetCsv,
    });
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Capturing Signal' })).toBeVisible();
  await expect(page.locator('.panel')).toHaveCount(1);
  await expect(page.getByAltText('Signal to Scale 2026')).toBeVisible();
  await expect(page.getByLabel('Presented by Xnurta')).toBeVisible();
  await expect(page.locator('.survey-cta')).toContainText('Scan to answer');
  expect(pageErrors).toEqual([]);
});

test('shows a graceful error state when the sheet fetch fails', async ({ page }) => {
  await page.route(sheetPattern, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'text/plain',
      body: 'failure',
    });
  });

  await page.goto('/');

  await expect(page.locator('.status-bar-error')).toContainText('Google Sheets fetch failed with status 500.');
  await expect(page.getByRole('heading', { name: 'Capturing Signal' })).toBeVisible();
  await expect(page.locator('.panel')).toHaveCount(1);
});

test('renders a stable empty-state dashboard when the sheet has no responses yet', async ({ page }) => {
  const emptyCsv = `Timestamp,How confident are you explaining 'agentic AI' to your team or stakeholders?\n`;

  await page.route(sheetPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/csv',
      body: emptyCsv,
    });
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Capturing Signal' })).toBeVisible();
  await expect(page.locator('.panel')).toHaveCount(1);
  await expect(page.locator('.metric-card').filter({ hasText: 'Responses' })).toContainText('0');
});

test('lets viewers switch back to dashboard mode', async ({ page }) => {
  await page.route(sheetPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/csv',
      body: liveSheetCsv,
    });
  });

  await page.goto('/');

  await page.getByRole('button', { name: 'Dashboard' }).click();
  await expect(page.locator('.panel')).toHaveCount(3);
  await expect(page.locator('.section-switcher')).toBeVisible();
});

test('lets viewers navigate the slide loop manually', async ({ page }) => {
  await page.route(sheetPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/csv',
      body: liveSheetCsv,
    });
  });

  await page.goto('/');

  await expect(page.locator('.slide-counter').first()).toContainText('1 / 8');
  await page.locator('.slide-dot').nth(1).click();
  await expect(page.locator('.slide-counter').last()).toContainText('2 / 8');
  await expect(page.getByText('Trust unlocks').first()).toBeVisible();
});
