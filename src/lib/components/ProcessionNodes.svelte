<script lang="ts">
	import { base } from '$app/paths';
	import { DESKTOP_NODE_SIZE, DESKTOP_NODES, PROCESSION_UI } from '$lib/data/procession-layout';

	const nodeSrc = `${base}${PROCESSION_UI.node}`;
</script>

<div class="procession-nodes" aria-hidden="true">
	{#each DESKTOP_NODES as node (node.id)}
		<img
			class="procession-nodes__mark"
			src={nodeSrc}
			alt=""
			width={DESKTOP_NODE_SIZE}
			height={DESKTOP_NODE_SIZE}
			style:left="{node.left}px"
			style:top="{node.top}px"
		/>
	{/each}
</div>

<style>
	.procession-nodes {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 2;
	}

	.procession-nodes__mark {
		position: absolute;
		display: block;
		width: 27px;
		height: 27px;
	}

	@media (max-width: 1279px) {
		.procession-nodes {
			display: none;
		}
	}
</style>
