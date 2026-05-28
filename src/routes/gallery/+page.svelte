<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { collection, getDocs, orderBy, query } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { mapArtworkDoc, type ArtworkItem } from '$lib/gallery';

	let artworks = $state<ArtworkItem[]>([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			const q = query(collection(db, 'artworks'), orderBy('createdAt', 'desc'));
			const snapshot = await getDocs(q);

			artworks = snapshot.docs
				.map((doc) => mapArtworkDoc(doc.data() as Record<string, unknown>))
				.filter((item): item is ArtworkItem => item !== null);
		} catch (err) {
			console.error('Gallery load failed:', err);
			error = 'Unable to load gallery.';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>ARMA CHRISTI GALLERY</title>
</svelte:head>

<div id="gallery">
	{#if loading}
		<p class="status">Loading...</p>
	{:else if error}
		<p class="status">{error}</p>
	{:else}
		{#each artworks as artwork}
			<div class="artwork">
				<img src={artwork.imageData} alt="Artwork trace" loading="lazy" />
			</div>
		{/each}
	{/if}
</div>

<a id="navHome" class="navBtn" href={`${base}/`}>Home</a>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		background: black;
		overflow-x: hidden;
	}

	#gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 20px;
		padding: 20px;
	}

	.artwork {
		width: 100%;
		background: #111;
		border-radius: 20px;
		overflow: hidden;
	}

	.artwork img {
		width: 100%;
		display: block;
	}

	.status {
		color: #cccccc;
		margin: 20px;
		font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
	}

	.navBtn {
		position: fixed;
		top: 20px;
		left: 20px;
		z-index: 100000;
		background: white;
		color: black;
		text-decoration: none;
		padding: 10px 16px;
		border-radius: 999px;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 1px;
		text-transform: uppercase;
	}
</style>
