import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/chains');
	expect(await page.textContent('h1')).toBe('Chains: Wagmi compatible chain configurations');
});
