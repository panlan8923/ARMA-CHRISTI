<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'animejs';
	import { createDrawable } from 'animejs/svg';
	import armaChristiMarkup from '$lib/assets/arma-christi.svg?raw';
	import {
		DRAW_DURATION_MS,
		DRAW_EASE,
		DRAW_START_DELAY_MS,
		GHOST_OPACITY,
		getFinalDraw,
		getInitialDraw,
		prefersReducedMotion
	} from '$lib/hero-logo-animation';

	let root: HTMLDivElement;
	let ghostEl: SVGGElement | null = null;

	onMount(() => {
		const trace = root.querySelector<SVGPathElement>('#tracciato');
		if (!trace) return;

		ghostEl = root.querySelector<SVGGElement>('#hero-logo-ghost');

		const [drawable] = createDrawable(trace);

		if (prefersReducedMotion()) {
			drawable.setAttribute('draw', getFinalDraw());
			if (ghostEl) ghostEl.style.opacity = '0';
			return;
		}

		drawable.setAttribute('draw', getInitialDraw());
		if (ghostEl) ghostEl.style.opacity = String(GHOST_OPACITY);

		const ghostFade = ghostEl
			? animate(ghostEl, {
					opacity: 0,
					duration: DRAW_DURATION_MS,
					ease: DRAW_EASE,
					delay: DRAW_START_DELAY_MS
				})
			: null;

		const traceDraw = animate(drawable, {
			draw: getFinalDraw(),
			duration: DRAW_DURATION_MS,
			ease: DRAW_EASE,
			delay: DRAW_START_DELAY_MS
		});

		return () => {
			traceDraw.pause();
			ghostFade?.pause();
		};
	});
</script>

<div
	class="hero-logo"
	style:--hero-ghost-opacity={GHOST_OPACITY}
	bind:this={root}
	role="img"
	aria-label="ARMA CHRISTI"
>
	{@html armaChristiMarkup}
</div>

<style>
	.hero-logo {
		display: block;
		width: min(680px, 90vw);
		max-height: 58vh;
		line-height: 0;
	}

	.hero-logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
		max-height: 58vh;
	}

	.hero-logo :global(#hero-logo-ghost) {
		opacity: var(--hero-ghost-opacity, 0.15);
	}
</style>
