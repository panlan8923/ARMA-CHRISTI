<script lang="ts">
	import { base } from '$app/paths';
	import { DESKTOP_GRID_MARKS, PROCESSION_UI } from '$lib/data/procession-layout';

	const gridCrossSrc = `${base}${PROCESSION_UI.gridCross}`;
</script>

<div class="procession-grid" aria-hidden="true">
	{#each DESKTOP_GRID_MARKS as mark, index (index)}
		<img
			class="procession-grid__mark"
			src={gridCrossSrc}
			alt=""
			width="37"
			height="37"
			style:left="{mark.left}px"
			style:top="{mark.top}px"
		/>
	{/each}
</div>

<style>
	.procession-grid {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}

	.procession-grid__mark {
		position: absolute;
		display: block;
		width: 37px;
		height: 37px;
	}

	@media (max-width: 1279px) {
		.procession-grid {
			display: none;
		}
	}
</style>
