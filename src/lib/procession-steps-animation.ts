import { animate, createScope, onScroll, utils, type Scope } from 'animejs';

type ProcessionLayout = 'desktop' | 'mobile';
type RevealDirection = 'left' | 'right' | 'up';

function getStepContent(step: HTMLElement): HTMLElement {
	return step.querySelector<HTMLElement>('[data-procession-step-content]') ?? step;
}

function getStepAnchor(step: HTMLElement): HTMLElement {
	return step.querySelector<HTMLElement>('[data-procession-step-anchor]') ?? step;
}

function getDesktopMotion(reveal: RevealDirection | null) {
	switch (reveal) {
		case 'left':
			return {
				translateX: ['-60px', '0px'] as [string, string],
				translateY: ['0px', '0px'] as [string, string]
			};
		case 'right':
			return {
				translateX: ['60px', '0px'] as [string, string],
				translateY: ['0px', '0px'] as [string, string]
			};
		default:
			return {
				translateX: ['0px', '0px'] as [string, string],
				translateY: ['24px', '0px'] as [string, string]
			};
	}
}

function getMobileMotion() {
	return {
		translateX: ['0px', '0px'] as [string, string],
		translateY: ['24px', '0px'] as [string, string]
	};
}

function initStep01(scope: Scope, stepContent: HTMLElement): void {
	if (scope.matches.reducedMotion) {
		utils.set(stepContent, {
			opacity: 1,
			translateX: 0,
			translateY: 0
		});
		return;
	}

	utils.set(stepContent, {
		opacity: 0,
		translateY: '24px'
	});

	animate(stepContent, {
		opacity: [0, 1],
		translateY: ['24px', '0px'],
		duration: 700,
		ease: 'out(3)'
	});
}

function getDesktopArrivoMotion() {
	return {
		translateX: ['0px', '0px'] as [string, string],
		translateY: ['40px', '0px'] as [string, string]
	};
}

function getScrollThresholds(
	layout: ProcessionLayout,
	index: number,
	stepCount: number
): {
	enter: { target: 'top'; container: string };
	leave: { target: 'top'; container: string };
} {
	const isLastStep = index === stepCount - 1;

	if (layout === 'desktop' && isLastStep) {
		return {
			enter: { target: 'top', container: '82%' },
			leave: { target: 'top', container: '55%' }
		};
	}

	return {
		enter: { target: 'top', container: 'bottom' },
		leave: isLastStep && layout === 'mobile'
			? { target: 'top', container: 'min' }
			: { target: 'top', container: 'center' }
	};
}

function initScrollSteps(scope: Scope, steps: HTMLElement[], layout: ProcessionLayout): void {
	for (let index = 1; index < steps.length; index++) {
		const step = steps[index];
		const stepContent = getStepContent(step);
		const stepAnchor = getStepAnchor(step);
		const reveal = step.getAttribute('data-procession-reveal') as RevealDirection | null;
		const isDesktopArrivo = layout === 'desktop' && index === steps.length - 1;
		const motion = isDesktopArrivo
			? getDesktopArrivoMotion()
			: layout === 'desktop'
				? getDesktopMotion(reveal)
				: getMobileMotion();
		const scrollThresholds = getScrollThresholds(layout, index, steps.length);

		utils.set(stepContent, {
			opacity: 0,
			translateX: motion.translateX[0],
			translateY: motion.translateY[0]
		});

		animate(stepContent, {
			opacity: [0, 1],
			translateX: motion.translateX,
			translateY: motion.translateY,
			ease: 'out(3)',
			autoplay: onScroll({
				target: stepAnchor,
				axis: 'y',
				...scrollThresholds,
				sync: true,
				debug: false
			})
		});
	}
}

function initSteps(scope: Scope, layout: ProcessionLayout): void {
	const steps = utils.$('[data-procession-step]') as HTMLElement[];
	if (steps.length !== 5) return;

	const stepContents = steps.map(getStepContent);

	if (scope.matches.reducedMotion) {
		utils.set(stepContents, {
			opacity: 1,
			translateX: 0,
			translateY: 0
		});
		return;
	}

	initStep01(scope, stepContents[0]);
	initScrollSteps(scope, steps, layout);
}

export function createProcessionStepsScope(root: HTMLElement) {
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
			initSteps(scope, 'desktop');
		} else if (scope.matches.mobile) {
			initSteps(scope, 'mobile');
		}
	});
}
