<script lang="ts">
	/** Path geometry exported from Figma layer "Line" (node 200:217), viewBox origin at line top-left. */
	const PATH_D =
		'M156.5 2567.5V2432.87C156.5 2415 166.08 2398.47 181.554 2389.54C235.231 2358.59 269.334 2339.03 289.618 2327.44C305.293 2318.49 315 2301.83 315 2283.78V1955C315 1937.45 305.794 1921.18 290.745 1912.14L26.2551 1753.28C11.2062 1744.24 2 1727.97 2 1710.42V1374.58C2 1356.71 11.53 1340.21 27 1331.28L290 1179.43C305.47 1170.5 315 1154 315 1136.13V800.578C315 782.715 305.47 766.209 290 757.277L27 605.434C11.5299 596.502 2 579.996 2 562.133V0';

	const VIEWBOX = '0 0 317 2583';

	const NODES = [
		{ cx: 0, cy: -10, label: 'Step 01' },
		{ cx: 313, cy: 958, label: 'Step 02' },
		{ cx: 0, cy: 1543, label: 'Step 03' },
		{ cx: 313, cy: 2114, label: 'Step 04' },
		{ cx: 155, cy: 2573, label: 'Step 05' }
	] as const;
</script>

<svg
	class="procession-path-svg"
	viewBox={VIEWBOX}
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<path
		class="procession-path procession-path--dotted"
		d={PATH_D}
		stroke="#CCCCCC"
		stroke-width="4"
		stroke-dasharray="1 10"
	/>
	<path
		class="procession-path procession-path--trace"
		id="procession-trace"
		d={PATH_D}
		stroke="#CCCCCC"
		stroke-width="4"
	/>
	{#each NODES as node (node.label)}
		<circle
			class="procession-node"
			cx={node.cx}
			cy={node.cy}
			r="10"
			fill="#CCCCCC"
		/>
	{/each}
</svg>

<style>
	.procession-path-svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.procession-path {
		fill: none;
	}
</style>
