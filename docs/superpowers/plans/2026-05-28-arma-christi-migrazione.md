# ARMA CHRISTI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the old `old/` Home and Gallery inside SvelteKit with identical look/behavior while keeping the same existing drawings storage.

**Architecture:** Keep each page as its own Svelte route (`/` and `/gallery`) with page-local CSS and page-local interaction logic. Move shared Firebase setup to one lib module so both pages read/write the same collection. Add focused tests: one unit test for mapping gallery data and one e2e smoke test for navigation and drawing UI presence.

**Tech Stack:** SvelteKit 2 + Svelte 5, TypeScript, Firebase Firestore web SDK, Vitest, Playwright.

---

## File structure and responsibilities

- Create: `src/lib/firebase.ts` - shared Firebase app + Firestore config.
- Create: `src/lib/gallery.ts` - safe mapper from Firestore doc data to renderable artwork item.
- Modify: `src/routes/+page.svelte` - Home screen UI, canvas drawing, submit flow, leave warning.
- Create: `src/routes/gallery/+page.svelte` - Gallery screen UI with loading/error handling.
- Create: `src/lib/gallery.spec.ts` - mapper unit tests.
- Create: `src/routes/arma-christi.e2e.ts` - Home/Gallery smoke test.
- Modify: `README.md` - route usage note.

### Task 1: Create shared Firebase module

**Files:**
- Create: `src/lib/firebase.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Test: `npm run check`

- [ ] **Step 1: Install Firebase package**

Run:
```bash
npm install firebase
```
Expected: package install success and lockfile update.

- [ ] **Step 2: Create Firebase module**

```ts
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'AIzaSyAZVhboBByfpVQnZFLZYBqFjyVVjvvd08M',
	authDomain: 'arma-christi-wall.firebaseapp.com',
	projectId: 'arma-christi-wall',
	storageBucket: 'arma-christi-wall.firebasestorage.app',
	messagingSenderId: '191623333645',
	appId: '1:191623333645:web:f0add4a441b5d31fb59244',
	measurementId: 'G-5GBRR963ER'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

- [ ] **Step 3: Verify baseline type checks**

Run:
```bash
npm run check
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/firebase.ts
git commit -m "chore: add shared firebase setup"
```

### Task 2: Build Home page in Svelte with parity

**Files:**
- Modify: `src/routes/+page.svelte`
- Create: `src/routes/arma-christi.e2e.ts`
- Test: `src/routes/arma-christi.e2e.ts`

- [ ] **Step 1: Write failing e2e test for Home**

```ts
// src/routes/arma-christi.e2e.ts
import { expect, test } from '@playwright/test';

test('home shows draw UI', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#draw')).toBeVisible();
	await expect(page.getByRole('button', { name: 'submit trace' })).toBeVisible();
	await expect(page.getByText('Scopri le realtà indipendenti di Perugia')).toBeVisible();
});
```

- [ ] **Step 2: Run the test and confirm failure**

Run:
```bash
npm run test:e2e -- src/routes/arma-christi.e2e.ts
```
Expected: FAIL because starter page is still present.

- [ ] **Step 3: Replace `src/routes/+page.svelte` with Home implementation**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
	import { db } from '$lib/firebase';

	let canvas: HTMLCanvasElement;
	let drawSection: HTMLElement;
	let navGalleryBtn: HTMLAnchorElement;
	let drawing = false;
	let lastX = 0;
	let lastY = 0;
	let hasUnsavedChanges = false;
	let isSubmitting = false;
	let showGallery = $state(false);
	let submitLabel = $state('submit trace');
	let submitDisabled = $state(false);

	function resizeCanvas() {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		canvas.width = drawSection.clientWidth;
		canvas.height = drawSection.clientHeight;
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		hasUnsavedChanges = false;
	}

	function getPosition(e: MouseEvent | TouchEvent) {
		const rect = canvas.getBoundingClientRect();
		const touch = e instanceof TouchEvent ? e.touches[0] : undefined;
		const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
		const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;
		return { x: clientX - rect.left, y: clientY - rect.top };
	}

	function startDrawing(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		const pos = getPosition(e);
		drawing = true;
		lastX = pos.x;
		lastY = pos.y;
		hasUnsavedChanges = true;
	}

	function stopDrawing(e?: MouseEvent | TouchEvent) {
		e?.preventDefault();
		drawing = false;
	}

	function draw(e: MouseEvent | TouchEvent) {
		if (!drawing) return;
		e.preventDefault();
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const pos = getPosition(e);
		const offsetX = (Math.random() - 0.5) * 10;
		const offsetY = (Math.random() - 0.5) * 10;
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 12 + Math.random() * 14;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(lastX, lastY);
		ctx.lineTo(pos.x + offsetX, pos.y + offsetY);
		ctx.stroke();
		for (let i = 0; i < 8; i += 1) {
			ctx.beginPath();
			ctx.arc(pos.x + (Math.random() - 0.5) * 24, pos.y + (Math.random() - 0.5) * 24, Math.random() * 2, 0, Math.PI * 2);
			ctx.fillStyle = 'rgba(255,255,255,0.08)';
			ctx.fill();
		}
		lastX = pos.x;
		lastY = pos.y;
	}

	async function submitTrace() {
		if (isSubmitting) return;
		isSubmitting = true;
		submitDisabled = true;
		submitLabel = 'submitting...';
		try {
			await addDoc(collection(db, 'artworks'), {
				imageData: canvas.toDataURL('image/jpeg', 0.7),
				createdAt: serverTimestamp(),
				width: canvas.width,
				height: canvas.height,
				userAgent: navigator.userAgent
			});
			submitLabel = 'submitted';
			hasUnsavedChanges = false;
		} catch (error) {
			console.error('Submit failed:', error);
			submitLabel = 'failed';
		} finally {
			window.setTimeout(() => {
				submitLabel = 'submit trace';
				submitDisabled = false;
				isSubmitting = false;
			}, 1500);
		}
	}

	function handleGalleryClick(e: MouseEvent) {
		if (!hasUnsavedChanges) return;
		e.preventDefault();
		const message = isSubmitting
			? 'Submission is in progress. Are you sure you want to leave for the Gallery?'
			: 'You have an unsaved drawing. Are you sure you want to leave for the Gallery?';
		if (window.confirm(message)) window.location.href = navGalleryBtn.href;
	}

	onMount(() => {
		resizeCanvas();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) showGallery = entry.isIntersecting;
			},
			{ threshold: 0.1 }
		);
		observer.observe(drawSection);
		window.addEventListener('resize', resizeCanvas);
		navGalleryBtn.addEventListener('click', handleGalleryClick);
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', resizeCanvas);
			navGalleryBtn.removeEventListener('click', handleGalleryClick);
		};
	});
</script>

<svelte:head><title>ARMA CHRISTI</title></svelte:head>

<header class="hero">
	<img src="/lettering.svg" alt="ARMA CHRISTI" class="hero__logo" width="574" height="468" />
	<p class="hero__tagline">Scopri le realtà indipendenti di Perugia</p>
	<div class="hero__scroll-hint" aria-hidden="true"><span class="hero__scroll-label">inizia</span><span class="hero__scroll-arrow">↓</span></div>
</header>
<section id="drawSection" class="draw-section" bind:this={drawSection}>
	<canvas id="draw" bind:this={canvas} onmousedown={startDrawing} onmousemove={draw} onmouseup={stopDrawing} onmouseleave={stopDrawing} ontouchstart={startDrawing} ontouchmove={draw} ontouchend={stopDrawing} ontouchcancel={stopDrawing}></canvas>
	<button id="submitBtn" onclick={submitTrace} disabled={submitDisabled}>{submitLabel}</button>
</section>
<a id="navGallery" class={`navBtn ${showGallery ? 'visible' : ''}`} href="/gallery" bind:this={navGalleryBtn}>Gallery</a>

<style>
	:global(html), :global(body) { margin: 0; padding: 0; background: black; color: #cccccc; overflow-x: hidden; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; }
	.hero { box-sizing: border-box; min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px 40px; text-align: center; }
	.hero__logo { display: block; width: min(680px, 90vw); height: auto; max-height: 58vh; object-fit: contain; }
	.hero__tagline { margin: 28px 0 0; max-width: 28em; font-size: 14px; font-weight: 700; letter-spacing: 2px; line-height: 1.5; text-transform: uppercase; color: #999999; }
	.hero__scroll-hint { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 56px; }
	.hero__scroll-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.2em; text-transform: lowercase; color: #666666; }
	.hero__scroll-arrow { font-size: 1.25rem; line-height: 1; color: #666666; }
	.draw-section { position: relative; width: 100%; height: 100vh; height: 100dvh; }
	canvas { display: block; width: 100%; height: 100%; touch-action: none; }
	#submitBtn { position: absolute; left: 50%; bottom: 48px; transform: translateX(-50%); z-index: 999999; background: white; color: black; border: none; border-radius: 999px; padding: 16px 34px; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; }
	.navBtn { position: fixed; top: 20px; right: 20px; z-index: 100000; background: white; color: black; text-decoration: none; padding: 10px 16px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
	.navBtn.visible { opacity: 1; pointer-events: auto; }
</style>
```

- [ ] **Step 4: Re-run Home e2e**

Run:
```bash
npm run test:e2e -- src/routes/arma-christi.e2e.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/routes/+page.svelte src/routes/arma-christi.e2e.ts
git commit -m "feat: migrate home page with drawing parity"
```

### Task 3: Build Gallery page in Svelte

**Files:**
- Create: `src/lib/gallery.ts`
- Create: `src/lib/gallery.spec.ts`
- Create: `src/routes/gallery/+page.svelte`

- [ ] **Step 1: Write failing unit test**

```ts
// src/lib/gallery.spec.ts
import { describe, expect, it } from 'vitest';
import { mapArtworkDoc } from './gallery';

describe('mapArtworkDoc', () => {
	it('returns null when imageData missing', () => {
		expect(mapArtworkDoc({})).toBeNull();
	});
	it('returns item when imageData is string', () => {
		expect(mapArtworkDoc({ imageData: 'data:image/jpeg;base64,abc' })).toEqual({
			imageData: 'data:image/jpeg;base64,abc'
		});
	});
});
```

- [ ] **Step 2: Run unit test and confirm failure**

Run:
```bash
npm run test:unit -- src/lib/gallery.spec.ts
```
Expected: FAIL because mapper does not exist yet.

- [ ] **Step 3: Implement mapper and Gallery page**

```ts
// src/lib/gallery.ts
export type ArtworkItem = { imageData: string };

export function mapArtworkDoc(data: Record<string, unknown>): ArtworkItem | null {
	if (typeof data.imageData !== 'string' || data.imageData.length === 0) return null;
	return { imageData: data.imageData };
}
```

```svelte
<!-- src/routes/gallery/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
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

<svelte:head><title>ARMA CHRISTI GALLERY</title></svelte:head>

<div id="gallery">
	{#if loading}
		<p class="status">Loading...</p>
	{:else if error}
		<p class="status">{error}</p>
	{:else}
		{#each artworks as artwork}
			<div class="artwork"><img src={artwork.imageData} alt="Artwork trace" loading="lazy" /></div>
		{/each}
	{/if}
</div>
<a id="navHome" class="navBtn" href="/">Home</a>

<style>
	:global(html), :global(body) { margin: 0; padding: 0; background: black; overflow-x: hidden; }
	#gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; padding: 20px; }
	.artwork { width: 100%; background: #111; border-radius: 20px; overflow: hidden; }
	.artwork img { width: 100%; display: block; }
	.status { color: #cccccc; margin: 20px; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; }
	.navBtn { position: fixed; top: 20px; left: 20px; z-index: 100000; background: white; color: black; text-decoration: none; padding: 10px 16px; border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
</style>
```

- [ ] **Step 4: Run unit test and ensure pass**

Run:
```bash
npm run test:unit -- src/lib/gallery.spec.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/gallery.ts src/lib/gallery.spec.ts src/routes/gallery/+page.svelte
git commit -m "feat: migrate gallery page with firestore loading"
```

### Task 4: Parity verification and docs

**Files:**
- Modify: `src/routes/arma-christi.e2e.ts`
- Modify: `README.md`

- [ ] **Step 1: Extend e2e for navigation**

```ts
test('navigates from home to gallery and back', async ({ page }) => {
	await page.goto('/');
	await page.locator('#drawSection').scrollIntoViewIfNeeded();
	await page.getByRole('link', { name: 'Gallery' }).click();
	await expect(page).toHaveURL(/\/gallery/);
	await page.getByRole('link', { name: 'Home' }).click();
	await expect(page).toHaveURL(/\/$/);
});
```

- [ ] **Step 2: Run quality checks**

Run:
```bash
npm run check
npm run test:unit -- --run
npm run test:e2e -- src/routes/arma-christi.e2e.ts
```
Expected: all PASS.

- [ ] **Step 3: Add README route note**

```md
## ARMA CHRISTI pages

- Home: `/`
- Gallery: `/gallery`
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/arma-christi.e2e.ts README.md
git commit -m "test: add route parity checks and docs note"
```
