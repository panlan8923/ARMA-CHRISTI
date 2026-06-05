import { expect, test } from '@playwright/test';

test('home shows draw UI', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('img', { name: 'ARMA CHRISTI' })).toBeVisible();
	await expect(page.locator('#draw')).toBeVisible();
	await expect(page.getByRole('button', { name: 'submit trace' })).toBeVisible();
	await expect(page.getByText('Scopri le realtà indipendenti di Perugia')).toBeVisible();
});

test('navigates from home to gallery and back', async ({ page }) => {
	await page.goto('/');
	await page.locator('#drawSection').scrollIntoViewIfNeeded();
	await page.getByRole('link', { name: 'Gallery' }).click();
	await expect(page).toHaveURL(/\/gallery/);
	await page.getByRole('link', { name: 'Home' }).click();
	await expect(page).toHaveURL(/\/$/);
});
