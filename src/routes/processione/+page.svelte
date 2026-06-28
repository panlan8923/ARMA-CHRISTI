<script lang="ts">
	import { base } from '$app/paths';
	import ProcessionArrow from '$lib/components/ProcessionArrow.svelte';
	import ProcessionGrid from '$lib/components/ProcessionGrid.svelte';
	import ProcessionNav from '$lib/components/ProcessionNav.svelte';
	import ProcessionNodes from '$lib/components/ProcessionNodes.svelte';
	import ProcessionPath from '$lib/components/ProcessionPath.svelte';
	import { DESKTOP_FRAME_HEIGHT } from '$lib/data/procession-layout';
	import {
		PROCESSION_DATE,
		PROCESSION_STOPS,
		type ProcessionEntityStop,
		type ProcessionStop,
		type ProcessionVenueStop
	} from '$lib/data/procession-stops';

	function isEntityStop(stop: ProcessionStop): stop is ProcessionEntityStop {
		return stop.kind === 'entity';
	}

	function isVenueStop(stop: ProcessionStop): stop is ProcessionVenueStop {
		return stop.kind === 'venue';
	}
</script>

<svelte:head>
	<title>ARMA CHRISTI — Processione</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<main class="procession-page" style:--frame-height="{DESKTOP_FRAME_HEIGHT}px">
	<ProcessionNav current="processione" />

	<h1 class="procession-hero__title">
		<span>Arma</span>
		<span>Christi</span>
	</h1>
	<p class="procession-hero__date">{PROCESSION_DATE}</p>

	<section class="procession-canvas" aria-label="Percorso della processione">
		<ProcessionGrid />

		<div class="procession-canvas__path" aria-hidden="true">
			<ProcessionPath />
		</div>

		<ProcessionNodes />

		{#each PROCESSION_STOPS as stop (stop.id)}
			<article class="procession-stop" data-stop={stop.id}>
				{#if isVenueStop(stop) && stop.side === 'right'}
					<p class="procession-stop__label">{stop.label}</p>
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
					<div class="procession-stop__venue-copy procession-stop__venue-copy--center">
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
							<div class="procession-stop__arrival-copy">
								{#each stop.footer.description as paragraph, index (index)}
									<p>{paragraph}</p>
								{/each}
							</div>
						</footer>
					{/if}
				{:else if isEntityStop(stop)}
					<h2 class="procession-stop__entity-title">{stop.title}</h2>
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
				{/if}
			</article>
		{/each}
	</section>
</main>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		background: #000000;
		color: #cccccc;
		overflow-x: hidden;
	}

	.procession-page {
		box-sizing: border-box;
		width: 100%;
		margin: 0 auto;
		padding: 20px 24px 64px;
		font-family: Inter, Arial, sans-serif;
	}

	.procession-hero__title {
		margin: 0 0 16px;
		font-size: 56px;
		font-weight: 700;
		line-height: 1;
		color: #cccccc;
	}

	.procession-hero__title span {
		display: block;
	}

	.procession-hero__date {
		margin: 0 0 32px;
		font-size: 14px;
		font-weight: 400;
		line-height: normal;
		color: #cccccc;
	}

	.procession-canvas {
		display: flex;
		flex-direction: column;
		gap: 48px;
	}

	.procession-canvas__path {
		width: min(100%, 240px);
		margin: 0 auto;
		order: -1;
	}

	.procession-stop {
		display: flex;
		flex-direction: column;
		gap: 16px;
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
		font-size: 32px;
		font-weight: 700;
		line-height: normal;
		color: #cccccc;
	}

	.procession-stop__venue-title span {
		display: block;
	}

	.procession-stop__venue-copy--center {
		text-align: center;
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
		font-size: 16px;
		font-weight: 400;
		line-height: normal;
		color: #cccccc;
	}

	.procession-stop__time--departure {
		font-size: 14px;
	}

	.procession-stop__entity-title {
		margin: 0;
		font-size: 28px;
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

	.procession-stop__arrival-footer {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.procession-stop__arrival-copy p {
		margin: 0;
		font-size: 16px;
		font-weight: 400;
		line-height: normal;
		text-align: justify;
		color: #cccccc;
	}

	.procession-stop__arrival-copy p + p {
		margin-top: 0;
	}

	@media (min-width: 1280px) {
		.procession-page {
			position: relative;
			width: 1280px;
			height: var(--frame-height);
			padding: 0;
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

		.procession-canvas__path {
			position: absolute;
			top: 404px;
			left: calc(50% + 0.5px);
			width: 313px;
			height: 2567.5px;
			margin: 0;
			transform: translateX(-50%);
			z-index: 1;
			order: unset;
		}

		.procession-canvas__path :global(.procession-path-svg) {
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

		.procession-stop > * {
			pointer-events: auto;
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

		.procession-stop[data-stop='arrivo'] .procession-stop__arrival-copy {
			position: absolute;
			top: 0;
			left: 638px;
			width: 344px;
		}
	}
</style>
