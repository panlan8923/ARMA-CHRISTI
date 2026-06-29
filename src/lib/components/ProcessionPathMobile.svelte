<script lang="ts">
	import { base } from '$app/paths';
	import {
		MOBILE_FRAME_WIDTH,
		MOBILE_NODES,
		MOBILE_NODE_SIZE,
		MOBILE_PATH,
		mobileNodeAssetLeft,
		mobileNodeAssetTop,
		PROCESSION_UI
	} from '$lib/data/procession-layout';

	const nodeSrc = `${base}${PROCESSION_UI.node}`;
	const { axisX, top: pathTop, height: pathHeight } = MOBILE_PATH;
</script>

<div class="procession-path-mobile" aria-hidden="true">
	<div
		class="procession-path-mobile__scroll-range"
		data-procession-scroll-range
		style:top="{pathTop}px"
		style:height="{pathHeight}px"
	></div>

	<svg
		class="procession-path-mobile__svg"
		viewBox="0 0 {MOBILE_FRAME_WIDTH} {pathHeight}"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style:top="{pathTop}px"
	>
		<line
			class="procession-path-mobile__line procession-path-mobile__line--dotted"
			data-procession-dotted-path
			x1={axisX}
			y1="0"
			x2={axisX}
			y2={pathHeight}
			stroke="#CCCCCC"
			stroke-width="4"
		/>
		<line
			class="procession-path-mobile__line procession-path-mobile__line--solid"
			data-procession-progress-path
			x1={axisX}
			y1="0"
			x2={axisX}
			y2={pathHeight}
			stroke="#CCCCCC"
			stroke-width="4"
		/>
	</svg>

	{#each MOBILE_NODES as node (node.id)}
		<img
			class="procession-path-mobile__node"
			src={nodeSrc}
			alt=""
			width={MOBILE_NODE_SIZE}
			height={MOBILE_NODE_SIZE}
			style:left="{mobileNodeAssetLeft()}px"
			style:top="{mobileNodeAssetTop(node.top)}px"
		/>
	{/each}
</div>

<style>
	.procession-path-mobile {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
	}

	.procession-path-mobile__scroll-range {
		position: absolute;
		left: 0;
		width: 1px;
		pointer-events: none;
		visibility: hidden;
	}

	.procession-path-mobile__svg {
		position: absolute;
		left: 0;
		display: block;
		width: 390px;
		height: 2160.5px;
		overflow: visible;
	}

	.procession-path-mobile__line {
		vector-effect: non-scaling-stroke;
	}

	.procession-path-mobile__line--dotted {
		stroke-dasharray: 0 10;
		stroke-linecap: round;
	}

	.procession-path-mobile__node {
		position: absolute;
		display: block;
		width: 27px;
		height: 27px;
		z-index: 2;
	}
</style>
