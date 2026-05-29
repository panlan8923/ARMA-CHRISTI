<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
	import { signOutAdmin, subscribeToAuthState } from '$lib/auth';
	import { db } from '$lib/firebase';
	import {
		filterArtworksForDisplay,
		mapArtworkDoc,
		type ArtworkItem,
		type ArtworkVisibility
	} from '$lib/gallery';

	let artworks = $state<ArtworkItem[]>([]);
	let loading = $state(true);
	let error = $state('');
	let isAdmin = $state(false);
	let showHidden = $state(false);
	let pendingAction = $state<{ id: string; nextVisibility: ArtworkVisibility } | null>(null);
	let actionError = $state('');

	const displayedArtworks = $derived(filterArtworksForDisplay(artworks, { isAdmin, showHidden }));

	onMount(() => {
		const unsubscribeAuth = subscribeToAuthState((user) => {
			isAdmin = user !== null;
			if (!isAdmin) {
				showHidden = false;
			}
		});

		void loadArtworks();

		return () => {
			unsubscribeAuth();
		};
	});

	async function loadArtworks() {
		loading = true;
		error = '';

		try {
			const q = query(collection(db, 'artworks'), orderBy('createdAt', 'desc'));
			const snapshot = await getDocs(q);

			artworks = snapshot.docs
				.map((item) => mapArtworkDoc(item.id, item.data() as Record<string, unknown>))
				.filter((item): item is ArtworkItem => item !== null);
		} catch (err) {
			console.error('Gallery load failed:', err);
			error = 'Unable to load gallery.';
		} finally {
			loading = false;
		}
	}

	function requestVisibilityChange(id: string, nextVisibility: ArtworkVisibility) {
		actionError = '';
		pendingAction = { id, nextVisibility };
	}

	function cancelPendingAction() {
		pendingAction = null;
	}

	async function confirmPendingAction() {
		if (!pendingAction) return;

		const { id, nextVisibility } = pendingAction;
		actionError = '';

		try {
			await updateDoc(doc(db, 'artworks', id), { visibility: nextVisibility });
			artworks = artworks.map((item) =>
				item.id === id ? { ...item, visibility: nextVisibility } : item
			);
			pendingAction = null;
		} catch (err) {
			console.error('Visibility update failed:', err);
			actionError = 'Unable to update artwork.';
		}
	}

	async function handleSignOut() {
		await signOutAdmin();
		showHidden = false;
	}
</script>

<svelte:head>
	<title>ARMA CHRISTI GALLERY</title>
</svelte:head>

{#if isAdmin}
	<div class="admin-bar">
		<span class="admin-badge">Modalità admin</span>
		<label class="toggle">
			<input type="checkbox" bind:checked={showHidden} />
			Mostra anche i nascosti
		</label>
		<button type="button" class="sign-out" onclick={handleSignOut}>Esci</button>
	</div>
{/if}

<div id="gallery">
	{#if loading}
		<div class="gallery-loading" role="status" aria-label="Loading gallery">
			<div class="spinner" aria-hidden="true"></div>
		</div>
	{:else if error}
		<p class="status">{error}</p>
	{:else if displayedArtworks.length === 0}
		<p class="status">Nessun disegno da mostrare.</p>
	{:else}
		{#each displayedArtworks as artwork (artwork.id)}
			<div class="artwork" class:is-hidden={artwork.visibility === 'hidden'}>
				{#if artwork.visibility === 'hidden'}
					<span class="hidden-label">Nascosto</span>
				{/if}
				<img src={artwork.imageData} alt="Artwork trace" loading="lazy" />
				{#if isAdmin}
					<div class="artwork-actions">
						{#if artwork.visibility === 'hidden'}
							<button
								type="button"
								class="restore-btn"
								onclick={() => requestVisibilityChange(artwork.id, 'visible')}
							>
								Ripristina
							</button>
						{:else}
							<button
								type="button"
								class="hide-btn"
								onclick={() => requestVisibilityChange(artwork.id, 'hidden')}
							>
								Nascondi
							</button>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>

{#if pendingAction}
	<div class="confirm-backdrop" role="presentation" onclick={cancelPendingAction}></div>
	<div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
		<h2 id="confirm-title">
			{pendingAction.nextVisibility === 'hidden'
				? 'Nascondere questo disegno?'
				: 'Ripristinare questo disegno?'}
		</h2>
		<p>
			{pendingAction.nextVisibility === 'hidden'
				? 'I visitatori non lo vedranno più.'
				: 'Il disegno tornerà visibile a tutti.'}
		</p>
		{#if actionError}
			<p class="action-error" role="alert">{actionError}</p>
		{/if}
		<div class="confirm-actions">
			<button type="button" onclick={cancelPendingAction}>Annulla</button>
			<button type="button" class="confirm-btn" onclick={confirmPendingAction}>Conferma</button>
		</div>
	</div>
{/if}

<a id="navHome" class="navBtn" href={resolve('/')}>Home</a>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		background: black;
		overflow-x: hidden;
	}

	.admin-bar {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 100001;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		background: rgba(17, 17, 17, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 999px;
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			sans-serif;
		font-size: 13px;
		color: #ddd;
	}

	.admin-badge {
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
	}

	.sign-out {
		border: none;
		background: white;
		color: black;
		border-radius: 999px;
		padding: 8px 12px;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		cursor: pointer;
	}

	#gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 20px;
		padding: 20px;
		padding-top: 80px;
	}

	.artwork {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background: #111;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 20px;
		overflow: hidden;
	}

	.artwork.is-hidden {
		opacity: 0.5;
		border-style: dashed;
	}

	.hidden-label {
		position: absolute;
		top: 12px;
		left: 12px;
		z-index: 2;
		padding: 4px 8px;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.7);
		color: #fff;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
	}

	.artwork img {
		display: block;
		max-width: 100%;
		max-height: 60vh;
		width: auto;
		height: auto;
	}

	.artwork-actions {
		position: absolute;
		top: 12px;
		right: 12px;
		z-index: 2;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.artwork:hover .artwork-actions,
	.artwork:focus-within .artwork-actions {
		opacity: 1;
	}

	@media (hover: none) {
		.artwork-actions {
			opacity: 1;
		}
	}

	.hide-btn,
	.restore-btn {
		border: none;
		border-radius: 999px;
		padding: 8px 12px;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		cursor: pointer;
	}

	.hide-btn {
		background: rgba(255, 120, 120, 0.9);
		color: #1a0000;
	}

	.restore-btn {
		background: rgba(120, 220, 160, 0.95);
		color: #001a0d;
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
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			sans-serif;
	}

	.confirm-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.65);
		z-index: 100002;
	}

	.confirm-dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 100003;
		width: min(420px, calc(100vw - 40px));
		padding: 24px;
		background: #111;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 20px;
		color: white;
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			sans-serif;
	}

	.confirm-dialog h2 {
		margin: 0 0 8px;
		font-size: 18px;
	}

	.confirm-dialog p {
		margin: 0;
		color: #ccc;
		font-size: 14px;
	}

	.action-error {
		margin-top: 12px !important;
		color: #ff8a8a !important;
	}

	.confirm-actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 20px;
	}

	.confirm-actions button {
		border: none;
		border-radius: 999px;
		padding: 10px 14px;
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		cursor: pointer;
		background: #333;
		color: white;
	}

	.confirm-actions .confirm-btn {
		background: white;
		color: black;
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
