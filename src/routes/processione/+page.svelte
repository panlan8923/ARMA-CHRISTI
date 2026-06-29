<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import ProcessionArrow from '$lib/components/ProcessionArrow.svelte';
	import ProcessionGrid from '$lib/components/ProcessionGrid.svelte';
	import ProcessionNav from '$lib/components/ProcessionNav.svelte';
	import ProcessionNodes from '$lib/components/ProcessionNodes.svelte';
	import ProcessionPath from '$lib/components/ProcessionPath.svelte';
	import ProcessionPathMobile from '$lib/components/ProcessionPathMobile.svelte';
	import {
		DESKTOP_FRAME_HEIGHT,
		MOBILE_FRAME_HEIGHT,
		MOBILE_FRAME_WIDTH
	} from '$lib/data/procession-layout';
	import {
		PROCESSION_DATE,
		PROCESSION_STOPS,
		type ProcessionEntityStop,
		type ProcessionStop,
		type ProcessionVenueStop
	} from '$lib/data/procession-stops';
	import { createProcessionPathScope } from '$lib/procession-path-animation';
	import { createProcessionStepsScope } from '$lib/procession-steps-animation';

	const DESKTOP_STEP_REVEAL: Record<string, 'left' | 'right' | 'up'> = {
		partenza: 'up',
		'becoming-x': 'left',
		mannaggia: 'right',
		'cronache-ribelli': 'left',
		arrivo: 'up'
	};

	function getDesktopStepReveal(stop: ProcessionStop): 'left' | 'right' | 'up' {
		return DESKTOP_STEP_REVEAL[stop.id] ?? 'up';
	}

	let processionPage = $state<HTMLElement | null>(null);

	function isEntityStop(stop: ProcessionStop): stop is ProcessionEntityStop {
		return stop.kind === 'entity';
	}

	function isVenueStop(stop: ProcessionStop): stop is ProcessionVenueStop {
		return stop.kind === 'venue';
	}

	let viewportWidth = $state(MOBILE_FRAME_WIDTH);

	const mobileScale = $derived(
		viewportWidth < 1280 && viewportWidth < MOBILE_FRAME_WIDTH
			? viewportWidth / MOBILE_FRAME_WIDTH
			: 1
	);

	const mobileScalerHeight = $derived(
		mobileScale < 1 ? MOBILE_FRAME_HEIGHT * mobileScale : MOBILE_FRAME_HEIGHT
	);

	onMount(() => {
		if (!processionPage) return;

		const pathScope = createProcessionPathScope(processionPage);
		const stepsScope = createProcessionStepsScope(processionPage);

		return () => {
			stepsScope.revert();
			pathScope.revert();
		};
	});
</script>

<svelte:window bind:innerWidth={viewportWidth} />

<svelte:head>
	<title>ARMA CHRISTI — Processione</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="procession-page-scaler"
	class:procession-page-scaler--narrow={mobileScale < 1}
	style:height={mobileScale < 1 ? `${mobileScalerHeight}px` : undefined}
>
	<main
		bind:this={processionPage}
		class="procession-page"
		data-procession-page
		style:--frame-height="{DESKTOP_FRAME_HEIGHT}px"
		style:--mobile-frame-height="{MOBILE_FRAME_HEIGHT}px"
		style:transform={mobileScale < 1 ? `scale(${mobileScale})` : undefined}
		style:transform-origin={mobileScale < 1 ? 'top left' : undefined}
	>
		<ProcessionNav current="processione" />

		<h1 class="procession-hero__title">
			<span>Arma</span>
			<span>Christi</span>
		</h1>
		<p class="procession-hero__date">{PROCESSION_DATE}</p>

		<section class="procession-canvas" aria-label="Percorso della processione">
			<ProcessionGrid />

			<div
				class="procession-canvas__path procession-canvas__path--desktop"
				data-procession-layout="desktop"
				aria-hidden="true"
			>
				<div data-procession-scroll-range aria-hidden="true"></div>
				<ProcessionPath />
			</div>

			<div
				class="procession-canvas__path procession-canvas__path--mobile"
				data-procession-layout="mobile"
				aria-hidden="true"
			>
				<ProcessionPathMobile />
			</div>

			<ProcessionNodes />

			{#each PROCESSION_STOPS as stop, index (stop.id)}
				<article
					class="procession-stop"
					data-stop={stop.id}
					data-procession-step
					data-procession-step-index={index + 1}
					data-procession-reveal={getDesktopStepReveal(stop)}
				>
					<div class="procession-stop__content" data-procession-step-content>
						{#if isVenueStop(stop) && stop.side === 'right'}
							<p class="procession-stop__label" data-procession-step-anchor>{stop.label}</p>
							<h2 class="procession-stop__venue-title">
								{#each stop.title as line, index (index)}
									<span>{line}</span>
								{/each}
							</h2>
							<figure class="procession-stop__figure procession-stop__figure--departure">
								<img src={`${base}${stop.image.src}`} alt={stop.image.alt} loading="lazy" />
							</figure>
							<p class="procession-stop__time procession-stop__time--departure">{stop.time}</p>
						{:else if isVenueStop(stop) && stop.side === 'center'}
							<div
								class="procession-stop__venue-copy procession-stop__venue-copy--center"
								data-procession-step-anchor
							>
								<p class="procession-stop__label">{stop.label}</p>
								<h2 class="procession-stop__venue-title procession-stop__venue-title--single">
									{stop.title[0]}
								</h2>
							</div>
							<figure class="procession-stop__figure procession-stop__figure--arrival">
								<img src={`${base}${stop.image.src}`} alt={stop.image.alt} loading="lazy" />
							</figure>
							{#if stop.footer}
								<footer class="procession-stop__arrival-footer">
									<p class="procession-stop__time">{stop.footer.time}</p>
									<div class="arrival-description">
										<p class="arrival-description__text" lang="it">{stop.footer.description}</p>
										<p class="arrival-description__moderator">{stop.footer.moderator}</p>
									</div>
								</footer>
							{/if}
						{:else if isEntityStop(stop)}
							{#if stop.image}
								<figure
									class="procession-stop__figure procession-stop__figure--entity"
									data-stop-image={stop.id}
								>
									<img src={`${base}${stop.image.src}`} alt={stop.image.alt} loading="lazy" />
								</figure>
							{:else if stop.logo}
								<figure class="procession-stop__figure procession-stop__figure--logo">
									<img src={`${base}${stop.logo.src}`} alt={stop.logo.alt} loading="lazy" />
								</figure>
							{/if}

							<h2 class="procession-stop__entity-title" data-procession-step-anchor>{stop.title}</h2>
							<p class="procession-stop__entity-subtitle">{stop.subtitle}</p>
							<p class="procession-stop__entity-description" lang="it">{stop.description}</p>
							<div class="procession-stop__links">
								<span class="procession-stop__link-arrow" aria-hidden="true">
									<ProcessionArrow />
								</span>
								<div class="procession-stop__link-lines">
									{#each stop.links as link (`${link.href ?? 'text'}-${link.text}`)}
										{#if link.href}
											<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external venue links -->
											<a href={link.href} target="_blank" rel="noopener noreferrer">{link.text}</a>
										{:else}
											<span class="procession-stop__link-line">{link.text}</span>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</article>
			{/each}
		</section>
	</main>
</div>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		background: #000000;
		color: #cccccc;
		overflow-x: hidden;
	}

	.procession-page-scaler {
		width: 100%;
	}

	.procession-page {
		box-sizing: border-box;
		font-family: Inter, Arial, sans-serif;
	}

	.procession-hero__title {
		margin: 0;
		font-weight: 700;
		color: #cccccc;
	}

	.procession-hero__title span {
		display: block;
	}

	.procession-hero__date {
		margin: 0;
		font-size: 14px;
		font-weight: 400;
		line-height: normal;
		color: #cccccc;
	}

	.procession-canvas__path--desktop,
	.procession-canvas__path--mobile {
		display: none;
	}

	.procession-stop__content {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.procession-stop__content > * {
		pointer-events: auto;
	}

	.procession-stop__label {
		margin: 0;
		font-size: 20px;
		font-weight: 400;
		line-height: normal;
		color: #cccccc;
	}

	.procession-stop__venue-title {
		margin: 0;
		font-weight: 700;
		line-height: normal;
		color: #cccccc;
	}

	.procession-stop__venue-title span {
		display: block;
	}

	.procession-stop__figure {
		margin: 0;
		overflow: hidden;
	}

	.procession-stop__figure img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.procession-stop__figure--logo img {
		object-fit: contain;
	}

	.procession-stop__time {
		margin: 0;
		font-weight: 400;
		line-height: normal;
		color: #cccccc;
	}

	.procession-stop__entity-title {
		margin: 0;
		font-weight: 700;
		line-height: normal;
		color: #cccccc;
	}

	.procession-stop__entity-subtitle {
		margin: 0;
		font-size: 16px;
		font-weight: 400;
		line-height: normal;
		color: #cccccc;
	}

	.procession-stop__entity-description {
		margin: 0;
		font-size: 16px;
		font-weight: 400;
		line-height: normal;
		text-align: justify;
		color: #cccccc;
		hyphens: auto;
		-webkit-hyphens: auto;
	}

	.procession-stop__links {
		display: flex;
		align-items: flex-start;
		gap: 23px;
		margin: 0;
		padding: 0;
	}

	.procession-stop__link-lines {
		display: flex;
		flex-direction: column;
		font-size: 14px;
		font-weight: 400;
		line-height: normal;
		color: #cccccc;
	}

	.procession-stop__link-lines a,
	.procession-stop__link-line {
		display: block;
		color: inherit;
	}

	.procession-stop__link-lines a {
		text-decoration: none;
	}

	.procession-stop__link-lines a:hover,
	.procession-stop__link-lines a:focus-visible {
		text-decoration: underline;
	}

	.procession-stop__link-arrow {
		display: inline-flex;
		flex-shrink: 0;
		width: 27px;
		height: 27px;
	}

	.arrival-description {
		display: flex;
		flex-direction: column;
	}

	.arrival-description__text,
	.arrival-description__moderator {
		display: block;
		margin: 0;
		font-size: 16px;
		font-weight: 400;
		line-height: normal;
		text-align: justify;
		color: #cccccc;
	}

	.arrival-description__text {
		hyphens: auto;
		-webkit-hyphens: auto;
		overflow-wrap: normal;
	}

	.arrival-description__moderator {
		hyphens: none;
		-webkit-hyphens: none;
	}

	@media (max-width: 1279px) {
		.procession-page-scaler {
			display: flex;
			justify-content: center;
			overflow-x: hidden;
		}

		.procession-page-scaler--narrow {
			width: 100vw;
			justify-content: flex-start;
		}

		.procession-page {
			position: relative;
			width: 390px;
			height: var(--mobile-frame-height);
			padding: 0;
			margin: 0;
			overflow: hidden;
			flex-shrink: 0;
		}

		.procession-hero__title {
			position: absolute;
			top: 118px;
			left: 21px;
			width: 337px;
			height: 250px;
			font-size: 96px;
			line-height: 96px;
			z-index: 2;
		}

		.procession-hero__date {
			position: absolute;
			top: 319px;
			left: 21px;
			z-index: 2;
		}

		.procession-canvas {
			position: absolute;
			inset: 0;
			height: var(--mobile-frame-height);
		}

		.procession-canvas__path--mobile {
			display: block;
		}

		.procession-stop {
			position: absolute;
			inset: 0;
			margin: 0;
			z-index: 2;
			pointer-events: none;
		}

		/* Step 01 — Partenza */
		.procession-stop[data-stop='partenza'] .procession-stop__label {
			position: absolute;
			top: 384px;
			left: 59px;
		}

		.procession-stop[data-stop='partenza'] .procession-stop__venue-title {
			position: absolute;
			top: 404px;
			left: 59px;
			font-size: 36px;
		}

		.procession-stop[data-stop='partenza'] .procession-stop__figure--departure {
			display: none;
		}

		.procession-stop[data-stop='partenza'] .procession-stop__time--departure {
			position: absolute;
			top: 615px;
			left: 59px;
			font-size: 14px;
		}

		/* Step 02 — Becoming X */
		.procession-stop[data-stop='becoming-x'] .procession-stop__figure--entity {
			position: absolute;
			top: 713px;
			left: 59px;
			width: 310px;
			height: 265px;
		}

		.procession-stop[data-stop='becoming-x'] .procession-stop__figure--entity img {
			position: absolute;
			width: 114.2%;
			height: 100%;
			max-width: none;
			left: -14.2%;
			top: 0;
			object-fit: cover;
		}

		.procession-stop[data-stop='becoming-x'] .procession-stop__entity-title {
			position: absolute;
			top: 994px;
			left: 56px;
			font-size: 32px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='becoming-x'] .procession-stop__entity-subtitle {
			position: absolute;
			top: 1035px;
			left: 56px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='becoming-x'] .procession-stop__entity-description {
			position: absolute;
			top: 1070px;
			left: 56px;
			width: 311px;
			height: 168px;
		}

		.procession-stop[data-stop='becoming-x'] .procession-stop__links {
			position: absolute;
			top: 1219px;
			left: 56px;
			width: 313px;
		}

		/* Step 03 — Mannaggia */
		.procession-stop[data-stop='mannaggia'] .procession-stop__figure--entity {
			position: absolute;
			top: 1346px;
			left: 59px;
			width: 310px;
			height: 265px;
		}

		.procession-stop[data-stop='mannaggia'] .procession-stop__figure--entity img {
			position: absolute;
			width: 152.26%;
			height: 100.19%;
			max-width: none;
			left: -19.92%;
			top: -0.09%;
			object-fit: cover;
		}

		.procession-stop[data-stop='mannaggia'] .procession-stop__entity-title {
			position: absolute;
			top: 1627px;
			left: 56px;
			font-size: 32px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='mannaggia'] .procession-stop__entity-subtitle {
			position: absolute;
			top: 1668px;
			left: 56px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='mannaggia'] .procession-stop__entity-description {
			position: absolute;
			top: 1703px;
			left: 56px;
			width: 311px;
			height: 168px;
		}

		.procession-stop[data-stop='mannaggia'] .procession-stop__links {
			position: absolute;
			top: 1852px;
			left: 56px;
			width: 311px;
		}

		/* Step 04 — Cronache Ribelli */
		.procession-stop[data-stop='cronache-ribelli'] .procession-stop__figure--logo {
			position: absolute;
			top: 1979px;
			left: 57px;
			width: 313px;
			height: 215.81px;
		}

		.procession-stop[data-stop='cronache-ribelli'] .procession-stop__entity-title {
			position: absolute;
			top: 2211px;
			left: 56px;
			font-size: 32px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='cronache-ribelli'] .procession-stop__entity-subtitle {
			position: absolute;
			top: 2252px;
			left: 56px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='cronache-ribelli'] .procession-stop__entity-description {
			position: absolute;
			top: 2287px;
			left: 56px;
			width: 311px;
			height: 168px;
		}

		.procession-stop[data-stop='cronache-ribelli'] .procession-stop__links {
			position: absolute;
			top: 2436px;
			left: 56px;
			width: 311px;
		}

		/* Step 05 — Arrivo */
		.procession-stop[data-stop='arrivo'] .procession-stop__venue-copy--center {
			position: absolute;
			top: 2553px;
			left: 59px;
			text-align: left;
		}

		.procession-stop[data-stop='arrivo'] .procession-stop__venue-title--single {
			font-size: 36px;
		}

		.procession-stop[data-stop='arrivo'] .procession-stop__figure--arrival {
			display: none;
		}

		.procession-stop[data-stop='arrivo'] .procession-stop__arrival-footer {
			position: absolute;
			inset: 0;
			width: 390px;
			height: auto;
			pointer-events: none;
		}

		.procession-stop[data-stop='arrivo'] .procession-stop__arrival-footer > * {
			pointer-events: auto;
		}

		.procession-stop[data-stop='arrivo'] .procession-stop__time {
			position: absolute;
			top: 2558px;
			left: 296px;
			font-size: 14px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='arrivo'] .arrival-description {
			position: absolute;
			top: 2689px;
			left: 62px;
			width: 311px;
		}

		.procession-stop[data-stop='arrivo'] .arrival-description__moderator {
			margin-top: 1em;
		}
	}

	@media (min-width: 1280px) {
		.procession-page-scaler {
			display: block;
		}

		.procession-page {
			position: relative;
			width: 1280px;
			height: var(--frame-height);
			padding: 0;
			margin: 0 auto;
			overflow: hidden;
		}

		.procession-hero__title {
			position: absolute;
			top: 118px;
			left: 50px;
			width: 337px;
			height: 250px;
			margin: 0;
			font-size: 96px;
			line-height: 96px;
			z-index: 2;
		}

		.procession-hero__date {
			position: absolute;
			top: 399px;
			left: 50px;
			margin: 0;
			z-index: 2;
		}

		.procession-canvas {
			position: absolute;
			inset: 0;
			display: block;
			height: var(--frame-height);
		}

		.procession-canvas__path--desktop {
			display: block;
			position: absolute;
			top: 404px;
			left: calc(50% + 0.5px);
			width: 313px;
			height: 2567.5px;
			margin: 0;
			transform: translateX(-50%);
			z-index: 1;
		}

		.procession-canvas__path--desktop [data-procession-scroll-range] {
			position: absolute;
			inset: 0;
			width: 1px;
			pointer-events: none;
			visibility: hidden;
		}

		.procession-canvas__path--desktop :global(.procession-path-svg) {
			width: 313px;
			height: 2567.5px;
		}

		.procession-stop {
			position: absolute;
			inset: 0;
			display: block;
			margin: 0;
			gap: 0;
			z-index: 2;
			pointer-events: none;
		}

		/* Step 01 — Partenza */
		.procession-stop[data-stop='partenza'] .procession-stop__label {
			position: absolute;
			top: 394px;
			left: 514px;
		}

		.procession-stop[data-stop='partenza'] .procession-stop__venue-title {
			position: absolute;
			top: 422px;
			left: 514px;
			font-size: 46px;
			line-height: normal;
			white-space: nowrap;
		}

		.procession-stop[data-stop='partenza'] .procession-stop__figure--departure {
			display: block;
			position: absolute;
			top: 612px;
			left: 758px;
			width: 354px;
			height: 266px;
		}

		.procession-stop[data-stop='partenza'] .procession-stop__time--departure {
			position: absolute;
			top: 861px;
			left: 514px;
			font-size: 14px;
		}

		/* Step 02 — Becoming X */
		.procession-stop[data-stop='becoming-x'] .procession-stop__entity-title {
			position: absolute;
			top: 1176px;
			left: 50px;
			font-size: 32px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='becoming-x'] .procession-stop__entity-subtitle {
			position: absolute;
			top: 1217px;
			left: 50px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='becoming-x'] .procession-stop__entity-description {
			position: absolute;
			top: 1299px;
			left: 50px;
			width: 311px;
			height: 168px;
		}

		.procession-stop[data-stop='becoming-x'] .procession-stop__links {
			position: absolute;
			top: 1503px;
			left: 50px;
			width: 336px;
		}

		.procession-stop[data-stop='becoming-x'] .procession-stop__figure--entity {
			position: absolute;
			top: 1232px;
			left: 408px;
			width: 310px;
			height: 265px;
		}

		.procession-stop[data-stop='becoming-x'] .procession-stop__figure--entity img {
			position: absolute;
			width: 114.2%;
			height: 100%;
			max-width: none;
			left: -14.2%;
			top: 0;
			object-fit: cover;
		}

		/* Step 03 — Mannaggia */
		.procession-stop[data-stop='mannaggia'] .procession-stop__entity-title {
			position: absolute;
			top: 1761px;
			left: 562px;
			font-size: 32px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='mannaggia'] .procession-stop__entity-subtitle {
			position: absolute;
			top: 1802px;
			left: 562px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='mannaggia'] .procession-stop__entity-description {
			position: absolute;
			top: 1884px;
			left: 562px;
			width: 311px;
			height: 168px;
		}

		.procession-stop[data-stop='mannaggia'] .procession-stop__links {
			position: absolute;
			top: 2088px;
			left: 562px;
			width: 336px;
		}

		.procession-stop[data-stop='mannaggia'] .procession-stop__figure--entity {
			display: block;
			position: absolute;
			top: 1819px;
			left: 920px;
			width: 310px;
			height: 265px;
		}

		.procession-stop[data-stop='mannaggia'] .procession-stop__figure--entity img {
			position: absolute;
			width: 152.26%;
			height: 100.19%;
			max-width: none;
			left: -19.92%;
			top: -0.09%;
			object-fit: cover;
		}

		/* Step 04 — Cronache Ribelli */
		.procession-stop[data-stop='cronache-ribelli'] .procession-stop__entity-title {
			position: absolute;
			top: 2350px;
			left: 50px;
			font-size: 32px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='cronache-ribelli'] .procession-stop__entity-subtitle {
			position: absolute;
			top: 2391px;
			left: 50px;
			white-space: nowrap;
		}

		.procession-stop[data-stop='cronache-ribelli'] .procession-stop__entity-description {
			position: absolute;
			top: 2473px;
			left: 50px;
			width: 311px;
			height: 168px;
		}

		.procession-stop[data-stop='cronache-ribelli'] .procession-stop__links {
			position: absolute;
			top: 2677px;
			left: 50px;
			width: 336px;
		}

		.procession-stop[data-stop='cronache-ribelli'] .procession-stop__figure--logo {
			position: absolute;
			top: calc(50% + 608.41px);
			left: calc(50% - 75.5px);
			width: 313px;
			height: 215.81px;
			transform: translate(-50%, -50%);
		}

		/* Step 05 — Arrivo */
		.procession-stop[data-stop='arrivo'] .procession-stop__venue-copy--center {
			position: absolute;
			top: 3005px;
			left: calc(50% + 0.5px);
			transform: translateX(-50%);
			text-align: center;
			white-space: nowrap;
		}

		.procession-stop[data-stop='arrivo'] .procession-stop__venue-title--single {
			font-size: 46px;
		}

		.procession-stop[data-stop='arrivo'] .procession-stop__figure--arrival {
			display: block;
			position: absolute;
			top: 3146px;
			left: 294px;
			width: 688px;
			height: 387px;
		}

		.procession-stop[data-stop='arrivo'] .procession-stop__arrival-footer {
			position: absolute;
			top: 3548px;
			left: 0;
			width: 1280px;
			height: 99px;
		}

		.procession-stop[data-stop='arrivo'] .procession-stop__time {
			position: absolute;
			top: 0;
			left: 294px;
			width: 114px;
			font-size: 16px;
		}

		.procession-stop[data-stop='arrivo'] .arrival-description {
			position: absolute;
			top: 0;
			left: 638px;
			width: 344px;
		}
	}
</style>
