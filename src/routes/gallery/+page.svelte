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
		<div class="gallery-loading" role="status" aria-label="Loading gallery">
			<div class="spinner" aria-hidden="true"></div>
		</div>
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
		display: flex;
		justify-content: center;
		align-items: center;
		background: #111;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 20px;
		overflow: hidden;
	}

	.artwork img {
		display: block;
		max-width: 100%;
		max-height: 60vh;
		width: auto;
		height: auto;
	}

	.gallery-loading {
		position: fixed;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #333;
		border-top-color: #fff;
		border-radius: 50%;
		animation: gallery-spin 0.8s linear infinite;
	}

	@keyframes gallery-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.status {
		grid-column: 1 / -1;
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
