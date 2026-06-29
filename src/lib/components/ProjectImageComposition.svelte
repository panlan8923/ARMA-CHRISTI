<script lang="ts">
	import { base } from '$app/paths';
	import {
		getProjectImageById,
		MOBILE_IMAGE_ORDER,
		PROJECT_IMAGES,
		type ProjectImage
	} from '$lib/data/project-gallery';

	const DESKTOP_IMAGE_ORDER: ProjectImage['id'][] = ['01', '02', '03', '04'];
	const desktopImages = DESKTOP_IMAGE_ORDER.map(getProjectImageById);
	const mobileImages = MOBILE_IMAGE_ORDER.map(getProjectImageById);
</script>

<section class="project-composition" aria-label="Composizione immagini del progetto">
	<div class="project-composition__desktop">
		{#each desktopImages as image (image.id)}
			<figure class="project-composition__figure project-composition__figure--{image.id}">
				<img
					src={`${base}${image.src}`}
					alt={image.alt}
					width="1020"
					height={image.id === '04' ? '1384' : '660'}
					loading="lazy"
					decoding="async"
					draggable="false"
				/>
			</figure>
		{/each}

		<div class="project-composition__captions">
			{#each PROJECT_IMAGES as image (image.id)}
				<p class="project-composition__caption-line">
					{image.label} — <em>{image.title}</em>, {image.artist}, {image.year}
				</p>
			{/each}
		</div>
	</div>

	<div class="project-composition__mobile">
		{#each mobileImages as image (image.id)}
			<figure class="project-composition__mobile-item">
				<img
					src={`${base}${image.src}`}
					alt={image.alt}
					width="1020"
					height={image.id === '04' ? '1384' : '660'}
					loading="lazy"
					decoding="async"
					draggable="false"
				/>
				<figcaption class="project-composition__mobile-caption">
					{image.label} — <em>{image.title}</em>, {image.artist}, {image.year}
				</figcaption>
			</figure>
		{/each}
	</div>
</section>

<style>
	.project-composition {
		width: 100%;
	}

	.project-composition__mobile {
		display: flex;
		flex-direction: column;
		gap: 40px;
	}

	.project-composition__mobile-item {
		margin: 0;
	}

	.project-composition__mobile-item img {
		display: block;
		width: 100%;
		height: auto;
	}

	.project-composition__mobile-caption {
		margin: 12px 0 0;
		font-size: 12px;
		font-weight: 400;
		line-height: 1.45;
		color: #cccccc;
	}

	.project-composition__mobile-caption em {
		font-style: italic;
	}

	.project-composition__desktop {
		display: none;
	}

	@media (max-width: 1279px) {
		.project-composition__desktop {
			display: none;
		}

		.project-composition__mobile {
			display: flex;
		}
	}

	@media (min-width: 1280px) {
		.project-composition__mobile {
			display: none;
		}

		.project-composition__desktop {
			--composition-width: 1180px;
			--figure-width: 500px;
			--composition-gap: 24px;
			--horizontal-shift: 156px;
			--vertical-stagger: 144px;
			--figure-horizontal-height: calc(var(--figure-width) * 660 / 1020);
			--figure-vertical-height: calc(var(--figure-width) * 1384 / 1020);
			--fig-01-top: 0px;
			--fig-01-left: calc(var(--figure-width) + var(--composition-gap));
			--fig-02-top: var(--vertical-stagger);
			--fig-02-left: 0px;
			--fig-03-left: calc(var(--horizontal-shift) + var(--figure-width) + var(--composition-gap));
			--fig-03-top: calc(
				var(--fig-01-top) + var(--figure-horizontal-height) + var(--composition-gap)
			);
			--fig-04-left: var(--horizontal-shift);
			--fig-04-top: calc(
				var(--fig-02-top) + var(--figure-horizontal-height) + var(--composition-gap)
			);
			--captions-left: var(--fig-03-left);
			--captions-top: calc(
				var(--fig-03-top) + var(--figure-horizontal-height) + var(--composition-gap)
			);
			--composition-height: calc(var(--fig-04-top) + var(--figure-vertical-height));

			display: block;
			position: relative;
			width: var(--composition-width);
			max-width: 100%;
			min-height: var(--composition-height);
		}

		.project-composition__figure {
			position: absolute;
			width: var(--figure-width);
			margin: 0;
		}

		.project-composition__figure--01,
		.project-composition__figure--02,
		.project-composition__figure--03 {
			aspect-ratio: 1020 / 660;
		}

		.project-composition__figure--04 {
			aspect-ratio: 1020 / 1384;
		}

		.project-composition__figure img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: contain;
		}

		.project-composition__figure--01 {
			top: var(--fig-01-top);
			left: var(--fig-01-left);
		}

		.project-composition__figure--02 {
			top: var(--fig-02-top);
			left: var(--fig-02-left);
		}

		.project-composition__figure--03 {
			top: var(--fig-03-top);
			left: var(--fig-03-left);
		}

		.project-composition__figure--04 {
			top: var(--fig-04-top);
			left: var(--fig-04-left);
		}

		.project-composition__captions {
			position: absolute;
			top: var(--captions-top);
			left: var(--captions-left);
			width: var(--figure-width);
		}

		.project-composition__caption-line {
			margin: 0 0 0.35em;
			font-size: 12px;
			font-weight: 400;
			line-height: 1.45;
			color: #cccccc;
		}

		.project-composition__caption-line:last-child {
			margin-bottom: 0;
		}

		.project-composition__caption-line em {
			font-style: italic;
		}
	}
</style>
