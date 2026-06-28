<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		current?: 'home' | 'processione' | 'archivio';
	}

	let { current = 'processione' }: Props = $props();
</script>

<nav class="procession-nav" aria-label="Navigazione principale">
	<a
		class="procession-nav__link"
		href={resolve('/')}
		aria-current={current === 'home' ? 'page' : undefined}
	>
		Home
	</a>
	<a
		class="procession-nav__link"
		href={resolve('/processione')}
		aria-current={current === 'processione' ? 'page' : undefined}
	>
		Processione
	</a>
	<a
		class="procession-nav__link"
		href={resolve('/gallery')}
		aria-current={current === 'archivio' ? 'page' : undefined}
	>
		Archivio
	</a>
</nav>

<style>
	.procession-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		max-width: 1180px;
		min-height: 65px;
		margin: 0 auto;
		font-size: 16px;
		font-weight: 400;
		line-height: normal;
		color: #cccccc;
	}

	.procession-nav__link {
		color: inherit;
		text-decoration: none;
	}

	.procession-nav__link:hover,
	.procession-nav__link:focus-visible {
		text-decoration: underline;
	}

	.procession-nav__link[aria-current='page'] {
		text-decoration: underline;
	}

	@media (max-width: 1279px) {
		.procession-nav {
			position: absolute;
			top: 20px;
			left: 21px;
			width: 349px;
			max-width: none;
			height: 65px;
			min-height: 65px;
			margin: 0;
		}
	}

	@media (min-width: 1280px) {
		.procession-nav {
			position: absolute;
			top: 20px;
			left: calc(50% + 0.5px);
			width: 1180px;
			height: 65px;
			margin: 0;
			transform: translateX(-50%);
			z-index: 10;
		}
	}
</style>
