import { expect, test, type Page } from '@playwright/test';

type StepSnapshot = {
	index: string;
	opacity: number;
	translateX: number;
	translateY: number;
};

async function getStepStates(page: Page): Promise<StepSnapshot[]> {
	return page.evaluate(() => {
		const root = document.querySelector<HTMLElement>('[data-procession-page]');
		if (!root) return [];

		const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-procession-step]'));
		return steps.map((step) => {
			const content =
				step.querySelector<HTMLElement>('[data-procession-step-content]') ?? step;
			const style = getComputedStyle(content);
			const matrix = new DOMMatrixReadOnly(style.transform);
			const opacity = Number.parseFloat(style.opacity);

			return {
				index: step.dataset.processionStepIndex ?? '',
				opacity: Number.isNaN(opacity) ? 1 : opacity,
				translateX: matrix.m41,
				translateY: matrix.m42
			};
		});
	});
}

async function getDomDiagnostics(page: Page) {
	return page.evaluate(() => {
		const root = document.querySelector<HTMLElement>('[data-procession-page]');
		if (!root) return { stepCount: 0, steps: [], anchorCount: 0, observerCount: 0 };

		const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-procession-step]'));
		const anchors = Array.from(
			root.querySelectorAll<HTMLElement>('[data-procession-step-anchor]')
		);

		return {
			stepCount: steps.length,
			anchorCount: anchors.length,
			steps: steps.map((step) => {
				const rect = step.getBoundingClientRect();
				const content =
					step.querySelector<HTMLElement>('[data-procession-step-content]') ?? step;
				const style = getComputedStyle(content);

				return {
					index: step.dataset.processionStepIndex ?? '',
					top: rect.top,
					height: rect.height,
					opacity: style.opacity,
					transform: style.transform
				};
			})
		};
	});
}

async function scrollTo(page: Page, y: number) {
	await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
	await page.waitForTimeout(150);
}

const VIEWPORTS = [
	{ width: 390, height: 844, label: '390px' },
	{ width: 1279, height: 900, label: '1279px' },
	{ width: 1280, height: 900, label: '1280px' },
	{ width: 1440, height: 900, label: '1440px' }
] as const;

for (const viewport of VIEWPORTS) {
	test.describe(`procession steps @ ${viewport.label}`, () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: viewport.width, height: viewport.height });
			await page.goto('/processione');
			await page.waitForSelector('[data-procession-step]');
		});

		test('selects exactly five steps with five anchors', async ({ page }) => {
			const diagnostics = await getDomDiagnostics(page);
			expect(diagnostics.stepCount).toBe(5);
			expect(diagnostics.anchorCount).toBe(5);
			expect(diagnostics.steps.map((step) => step.index)).toEqual(['1', '2', '3', '4', '5']);
		});

		test('step 01 is visible after load; steps 02–05 hidden before scroll', async ({ page }) => {
			await page.waitForTimeout(800);

			const atTop = await getStepStates(page);
			expect(atTop[0].opacity).toBeGreaterThan(0.9);
			expect(atTop[0].translateY).toBeLessThan(2);

			for (const step of atTop.slice(1)) {
				expect(step.opacity).toBeLessThan(0.1);
			}
		});

		test('steps reveal while scrolling and step 05 completes at max scroll', async ({ page }) => {
			const maxScroll = await page.evaluate(
				() => document.documentElement.scrollHeight - window.innerHeight
			);

			await page.waitForTimeout(800);
			await scrollTo(page, Math.floor(maxScroll * 0.2));
			const early = await getStepStates(page);
			expect(early[0].opacity).toBeGreaterThan(0.9);
			expect(early[1].opacity).toBeGreaterThan(0.05);

			await scrollTo(page, Math.floor(maxScroll * 0.55));
			const mid = await getStepStates(page);
			expect(mid[2].opacity).toBeGreaterThan(0.05);
			if (viewport.width >= 1280) {
				expect(mid[3].opacity).toBeGreaterThan(0.05);
			}

			await scrollTo(page, maxScroll);
			const end = await getStepStates(page);

			for (const step of end) {
				expect(step.opacity).toBeGreaterThan(0.95);
				expect(Math.abs(step.translateX)).toBeLessThan(2);
				expect(Math.abs(step.translateY)).toBeLessThan(2);
			}
		});
	});
}
