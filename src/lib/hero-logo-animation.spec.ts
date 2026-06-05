import { describe, expect, it } from 'vitest';
import {
	DRAW_DURATION_MS,
	DRAW_EASE,
	DRAW_START_DELAY_MS,
	GHOST_OPACITY,
	getFinalDraw,
	getInitialDraw,
	prefersReducedMotion
} from './hero-logo-animation';

describe('hero-logo-animation', () => {
	it('exports spec timing values', () => {
		expect(DRAW_START_DELAY_MS).toBe(500);
		expect(DRAW_DURATION_MS).toBe(4500);
		expect(DRAW_EASE).toBe('inOutSine');
		expect(GHOST_OPACITY).toBe(0.15);
	});

	it('returns draw endpoints', () => {
		expect(getInitialDraw()).toBe('0 0');
		expect(getFinalDraw()).toBe('0 1');
	});

	it('detects reduced motion from media query', () => {
		const matchMedia = (matches: boolean) =>
			({ matches }) as Pick<MediaQueryList, 'matches'>;

		expect(prefersReducedMotion(matchMedia(true))).toBe(true);
		expect(prefersReducedMotion(matchMedia(false))).toBe(false);
	});
});
