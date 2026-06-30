<script lang="ts">
	import { base } from '$app/paths';
	import { PROCESSION_UI } from '$lib/data/procession-layout';

	const arrowSrc = `${base}${PROCESSION_UI.arrow}`;
</script>

<img class="procession-arrow" src={arrowSrc} alt="" width="27" height="27" />

<style>
	.procession-arrow {
		display: block;
		width: 27px;
		height: 27px;
		flex-shrink: 0;
	}
</style>
