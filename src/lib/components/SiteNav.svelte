<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		current?: 'home' | 'processione' | 'progetto';
		layout?: 'frame' | 'viewport';
	}

	let { current = 'processione', layout = 'frame' }: Props = $props();
</script>

<nav
	class="site-nav"
	class:site-nav--viewport={layout === 'viewport'}
	aria-label="Navigazione principale"
>
	<a
		class="site-nav__link"
		href={resolve('/')}
		aria-current={current === 'home' ? 'page' : undefined}
	>
		Home
	</a>
	<a
		class="site-nav__link"
		href={resolve('/processione')}
		aria-current={current === 'processione' ? 'page' : undefined}
	>
		Processione
	</a>
	<a
		class="site-nav__link"
		href={resolve('/progetto')}
		aria-current={current === 'progetto' ? 'page' : undefined}
	>
		Progetto
	</a>
</nav>

<style>
	.site-nav {
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
		position: relative;
		z-index: 100;
		pointer-events: auto;
	}

	.site-nav__link {
		color: inherit;
		text-decoration: none;
		position: relative;
		z-index: 1;
		pointer-events: auto;
		display: inline-flex;
		align-items: center;
		min-height: 32px;
	}

	.site-nav__link:hover,
	.site-nav__link:focus-visible {
		text-decoration: underline;
	}

	.site-nav__link[aria-current='page'] {
		text-decoration: underline;
	}

	@media (max-width: 1279px) {
		.site-nav {
			position: absolute;
			top: 20px;
			left: 21px;
			width: 349px;
			max-width: none;
			height: 65px;
			min-height: 65px;
			margin: 0;
			z-index: 100;
		}

		.site-nav--viewport {
			position: fixed;
			right: 21px;
			width: auto;
			z-index: 100;
		}
	}

	@media (min-width: 1280px) {
		.site-nav {
			position: absolute;
			top: 20px;
			left: calc(50% + 0.5px);
			width: 1180px;
			height: 65px;
			margin: 0;
			transform: translateX(-50%);
			z-index: 10;
		}

		.site-nav--viewport {
			position: fixed;
			left: 50%;
			transform: translateX(-50%);
			z-index: 100;
		}
	}
</style>
