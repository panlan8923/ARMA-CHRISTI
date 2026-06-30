<script lang="ts">
	import { base } from '$app/paths';
	import { DESKTOP_GRID_MARKS, PROCESSION_UI } from '$lib/data/procession-layout';

	interface Props {
		/** Visible grid rows from the top; defaults to the full procession frame (7 rows). */
		rows?: number;
	}

	let { rows }: Props = $props();

	const gridCrossSrc = `${base}${PROCESSION_UI.gridCross}`;

	const rowTops = [...new Set(DESKTOP_GRID_MARKS.map((mark) => mark.top))].sort(
		(a, b) => a - b
	);

	const marks = $derived.by(() => {
		if (rows === undefined) {
			return DESKTOP_GRID_MARKS;
		}

		const allowedTops = new Set(rowTops.slice(0, rows));
		return DESKTOP_GRID_MARKS.filter((mark) => allowedTops.has(mark.top));
	});
</script>

<div class="procession-grid" aria-hidden="true">
	{#each marks as mark, index (index)}
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
