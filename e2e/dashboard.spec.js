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

  await expect(page.getByRole('heading', { name: 'What the room thinks' })).toBeVisible();
  await expect(page.locator('.panel')).toHaveCount(8);
  await expect(page.locator('.status-bar')).toContainText('Google Forms via published Google Sheet');
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

  await expect(page.locator('.status-bar')).toContainText('Google Sheets fetch failed with status 500.');
  await expect(page.getByRole('heading', { name: 'What the room thinks' })).toBeVisible();
  await expect(page.locator('.panel')).toHaveCount(8);
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

  await expect(page.getByRole('heading', { name: 'What the room thinks' })).toBeVisible();
  await expect(page.locator('.panel')).toHaveCount(8);
  await expect(page.locator('.metric-card').filter({ hasText: 'Responses' })).toContainText('0');
});
