export const DRAW_START_DELAY_MS = 500;
export const DRAW_DURATION_MS = 4500;
export const DRAW_EASE = 'inOutSine';
export const GHOST_OPACITY = 0.15;

export function getInitialDraw(): `${number} ${number}` {
	return '0 0';
}

export function getFinalDraw(): `${number} ${number}` {
	return '0 1';
}

export function prefersReducedMotion(
	query: Pick<MediaQueryList, 'matches'> = window.matchMedia('(prefers-reduced-motion: reduce)')
): boolean {
	return query.matches;
}
