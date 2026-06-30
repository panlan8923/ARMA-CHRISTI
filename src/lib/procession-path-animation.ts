import { animate, createScope, onScroll, svg, type Scope } from 'animejs';

type ProcessionLayout = 'desktop' | 'mobile';

/** Desktop path starts at Arrivo (M…2567.5) and ends at Partenza (…V0); mobile line runs top→bottom. */
const DRAW_RANGE: Record<ProcessionLayout, [string, string]> = {
	desktop: ['1 1', '0 1'],
	mobile: ['0 0', '0 1']
};

const SCROLL_THRESHOLDS = {
	desktop: {
		enter: 'center top',
		leave: 'center bottom'
	},
	mobile: {
		enter: { target: 'top', container: 'center' },
		leave: { target: 'bottom', container: 'min' }
	}
} as const;

function initLayoutPathDraw(scope: Scope, layout: ProcessionLayout): void {
	const layoutRoot = scope.root.querySelector<HTMLElement>(`[data-procession-layout="${layout}"]`);
	if (!layoutRoot) return;

	const progressPath = layoutRoot.querySelector('[data-procession-progress-path]');
	const scrollRange = layoutRoot.querySelector('[data-procession-scroll-range]');
	if (!progressPath || !scrollRange) return;

	const [drawable] = svg.createDrawable(progressPath);

	if (scope.matches.reducedMotion) {
		drawable.setAttribute('draw', '0 1');
		return;
	}

	animate(drawable, {
		draw: DRAW_RANGE[layout],
		ease: 'linear',
		autoplay: onScroll({
			target: scrollRange,
			axis: 'y',
			...SCROLL_THRESHOLDS[layout],
			sync: true,
			debug: false
		})
	});
}

export function createProcessionPathScope(root: HTMLElement) {
	return createScope({
		root,
		mediaQueries: {
			desktop: '(min-width: 1280px)',
			mobile: '(max-width: 1279px)',
			reducedMotion: '(prefers-reduced-motion: reduce)'
		}
	}).add((scope) => {
		if (!scope) return;

		if (scope.matches.desktop) {
			initLayoutPathDraw(scope, 'desktop');
		} else if (scope.matches.mobile) {
			initLayoutPathDraw(scope, 'mobile');
		}
	});
}
