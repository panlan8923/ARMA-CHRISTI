import { expect, test } from '@playwright/test';

test('admin page shows password login', async ({ page }) => {
	await page.goto('/admin');
	await expect(page.getByLabel('Password')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Entra' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Torna alla home' })).toBeVisible();
});
