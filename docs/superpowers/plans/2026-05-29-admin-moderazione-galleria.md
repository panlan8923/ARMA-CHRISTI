# Admin Moderazione Galleria Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a protected `/admin` login and gallery moderation tools so authenticated admins can hide and restore artworks without deleting them, while visitors only see visible items.

**Architecture:** Extend the existing Firestore `artworks` documents with a `visibility` field (`visible` | `hidden`). Use Firebase Auth (email fixed in env, password entered on `/admin`) so credentials are not embedded in client code. Gallery reads auth state client-side; hide/restore writes only `visibility` via `updateDoc`. Public reads stay open; writes to `visibility` require an authenticated admin enforced by Firestore rules deployed manually in Firebase Console.

**Tech Stack:** SvelteKit 2 + Svelte 5, TypeScript, Firebase Auth + Firestore, Vitest, Playwright.

---

## File structure and responsibilities

- Modify: `src/lib/firebase.ts` — export shared `auth` instance alongside `db`.
- Create: `src/lib/auth.ts` — admin sign-in (password-only UX), sign-out, auth state helper.
- Modify: `src/lib/gallery.ts` — extend `ArtworkItem` with `id` and `visibility`; add `filterArtworksForDisplay()` helper.
- Modify: `src/lib/gallery.spec.ts` — unit tests for mapper + visibility filtering.
- Create: `src/routes/admin/+page.svelte` — dark minimal login page; redirect to gallery on success.
- Modify: `src/routes/gallery/+page.svelte` — admin toolbar, hide/restore with confirm dialogs, hidden styling.
- Create: `firestore.rules` — reference rules file for Firebase Console deployment.
- Create: `.env.example` — documents `PUBLIC_ADMIN_EMAIL` (not secret; password set in Firebase Console).
- Create: `src/routes/admin/admin.e2e.ts` — smoke test for login page UI (no live Firebase auth in CI).
- Modify: `README.md` — admin setup notes.

---

### Task 1: Extend artwork model and visibility filtering

**Files:**
- Modify: `src/lib/gallery.ts`
- Modify: `src/lib/gallery.spec.ts`
- Test: `src/lib/gallery.spec.ts`

- [ ] **Step 1: Write failing tests for visibility**

Add to `src/lib/gallery.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { filterArtworksForDisplay, mapArtworkDoc, type ArtworkItem } from './gallery';

const sample: ArtworkItem = {
	id: 'abc',
	imageData: 'data:image/jpeg;base64,abc',
	visibility: 'visible'
};

describe('mapArtworkDoc', () => {
	it('returns null when imageData missing', () => {
		expect(mapArtworkDoc('doc1', {})).toBeNull();
	});

	it('returns item when imageData is valid', () => {
		expect(mapArtworkDoc('doc1', { imageData: 'data:image/jpeg;base64,abc' })).toEqual({
			id: 'doc1',
			imageData: 'data:image/jpeg;base64,abc',
			visibility: 'visible'
		});
	});

	it('maps hidden visibility when present', () => {
		expect(
			mapArtworkDoc('doc2', { imageData: 'data:image/jpeg;base64,abc', visibility: 'hidden' })
		).toEqual({
			id: 'doc2',
			imageData: 'data:image/jpeg;base64,abc',
			visibility: 'hidden'
		});
	});
});

describe('filterArtworksForDisplay', () => {
	const visible = { ...sample, id: 'v', visibility: 'visible' as const };
	const hidden = { ...sample, id: 'h', visibility: 'hidden' as const };
	const items = [visible, hidden];

	it('hides hidden items for visitors', () => {
		expect(filterArtworksForDisplay(items, { isAdmin: false, showHidden: false })).toEqual([
			visible
		]);
	});

	it('hides hidden items for admin when toggle is off', () => {
		expect(filterArtworksForDisplay(items, { isAdmin: true, showHidden: false })).toEqual([
			visible
		]);
	});

	it('shows all items for admin when toggle is on', () => {
		expect(filterArtworksForDisplay(items, { isAdmin: true, showHidden: true })).toEqual(items);
	});
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:
```bash
npm run test:unit -- src/lib/gallery.spec.ts --run
```
Expected: FAIL — `filterArtworksForDisplay` not exported; `mapArtworkDoc` signature mismatch.

- [ ] **Step 3: Implement gallery model changes**

Replace `src/lib/gallery.ts` with:

```ts
export type ArtworkVisibility = 'visible' | 'hidden';

export type ArtworkItem = {
	id: string;
	imageData: string;
	visibility: ArtworkVisibility;
};

export function mapArtworkDoc(
	id: string,
	data: Record<string, unknown>
): ArtworkItem | null {
	if (typeof data.imageData !== 'string' || data.imageData.length === 0) {
		return null;
	}

	const visibility = data.visibility === 'hidden' ? 'hidden' : 'visible';

	return {
		id,
		imageData: data.imageData,
		visibility
	};
}

export function filterArtworksForDisplay(
	items: ArtworkItem[],
	options: { isAdmin: boolean; showHidden: boolean }
): ArtworkItem[] {
	if (options.isAdmin && options.showHidden) {
		return items;
	}

	return items.filter((item) => item.visibility !== 'hidden');
}
```

- [ ] **Step 4: Run tests and confirm pass**

Run:
```bash
npm run test:unit -- src/lib/gallery.spec.ts --run
```
Expected: PASS (3 tests in `filterArtworksForDisplay`, 3 in `mapArtworkDoc`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gallery.ts src/lib/gallery.spec.ts
git commit -m "feat: add artwork visibility model and filtering"
```

---

### Task 2: Firebase Auth module

**Files:**
- Modify: `src/lib/firebase.ts`
- Create: `src/lib/auth.ts`
- Create: `.env.example`
- Test: `npm run check`

- [ ] **Step 1: Extend Firebase module with Auth**

Update `src/lib/firebase.ts`:

```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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
export const auth = getAuth(app);
```

- [ ] **Step 2: Create auth helper**

Create `src/lib/auth.ts`:

```ts
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	type User
} from 'firebase/auth';
import { auth } from '$lib/firebase';

const adminEmail = import.meta.env.PUBLIC_ADMIN_EMAIL;

export function getAdminEmail(): string {
	if (!adminEmail) {
		throw new Error('PUBLIC_ADMIN_EMAIL is not configured');
	}
	return adminEmail;
}

export async function signInAdmin(password: string): Promise<User> {
	const result = await signInWithEmailAndPassword(auth, getAdminEmail(), password);
	return result.user;
}

export async function signOutAdmin(): Promise<void> {
	await signOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
	return onAuthStateChanged(auth, callback);
}
```

- [ ] **Step 3: Add env example**

Create `.env.example`:

```env
# Email of the single shared admin account (created in Firebase Console > Authentication)
PUBLIC_ADMIN_EMAIL=admin@arma-christi.it
```

- [ ] **Step 4: Verify type checks**

Run:
```bash
npm run check
```
Expected: PASS (gallery page still compiles; `mapArtworkDoc` call sites will fail until Task 4 — if check fails on gallery, note it and proceed; Task 4 fixes call sites).

- [ ] **Step 5: Commit**

```bash
git add src/lib/firebase.ts src/lib/auth.ts .env.example
git commit -m "feat: add firebase auth helpers for admin login"
```

---

### Task 3: Admin login page

**Files:**
- Create: `src/routes/admin/+page.svelte`
- Create: `src/routes/admin/admin.e2e.ts`
- Test: `src/routes/admin/admin.e2e.ts`

- [ ] **Step 1: Write failing e2e smoke test**

Create `src/routes/admin/admin.e2e.ts`:

```ts
import { expect, test } from '@playwright/test';

test('admin page shows password login', async ({ page }) => {
	await page.goto('/admin');
	await expect(page.getByLabel('Password')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Entra' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Torna alla home' })).toBeVisible();
});
```

- [ ] **Step 2: Run e2e and confirm failure**

Run:
```bash
npm run test:e2e -- src/routes/admin/admin.e2e.ts
```
Expected: FAIL — route `/admin` not found (404).

- [ ] **Step 3: Implement admin login page**

Create `src/routes/admin/+page.svelte`:

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { signInAdmin } from '$lib/auth';

	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		loading = true;

		try {
			await signInAdmin(password);
			await goto(`${base}/gallery`);
		} catch {
			error = 'Password non corretta';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>ARMA CHRISTI — Admin</title>
</svelte:head>

<main class="admin-page">
	<form class="login-card" onsubmit={handleSubmit}>
		<h1>Area admin</h1>
		<label for="password">Password</label>
		<input
			id="password"
			type="password"
			autocomplete="current-password"
			bind:value={password}
			disabled={loading}
			required
		/>
		{#if error}
			<p class="error" role="alert">{error}</p>
		{/if}
		<button type="submit" disabled={loading}>{loading ? 'Accesso...' : 'Entra'}</button>
	</form>

	<a class="home-link" href={`${base}/`}>Torna alla home</a>
</main>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		background: black;
		color: white;
	}

	.admin-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 24px;
		font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
	}

	.login-card {
		width: min(360px, calc(100vw - 40px));
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 32px;
		background: #111;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 20px;
	}

	h1 {
		margin: 0 0 8px;
		font-size: 20px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	label {
		font-size: 14px;
		color: #cccccc;
	}

	input {
		padding: 12px 14px;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: #000;
		color: white;
		font-size: 16px;
	}

	button {
		margin-top: 8px;
		padding: 12px 16px;
		border: none;
		border-radius: 999px;
		background: white;
		color: black;
		font-size: 14px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error {
		margin: 0;
		color: #ff8a8a;
		font-size: 14px;
	}

	.home-link {
		color: #cccccc;
		font-size: 14px;
	}
</style>
```

- [ ] **Step 4: Run e2e and confirm pass**

Run:
```bash
npm run test:e2e -- src/routes/admin/admin.e2e.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/routes/admin/+page.svelte src/routes/admin/admin.e2e.ts
git commit -m "feat: add admin login page"
```

---

### Task 4: Gallery public filtering and admin moderation UI

**Files:**
- Modify: `src/routes/gallery/+page.svelte`
- Test: `npm run check`, `npm run test:unit -- --run`

- [ ] **Step 1: Update gallery page with auth state, filtering, and admin controls**

Replace `src/routes/gallery/+page.svelte` with:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
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

	const displayedArtworks = $derived(
		filterArtworksForDisplay(artworks, { isAdmin, showHidden })
	);

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

<a id="navHome" class="navBtn" href={`${base}/`}>Home</a>

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
		font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
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
		font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
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
		font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
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
```

- [ ] **Step 2: Run unit tests and type checks**

Run:
```bash
npm run test:unit -- --run
npm run check
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/routes/gallery/+page.svelte
git commit -m "feat: add gallery admin moderation controls"
```

---

### Task 5: Firestore security rules and Firebase Console setup

**Files:**
- Create: `firestore.rules`
- Modify: `README.md`

This task is manual in Firebase Console plus a reference rules file in the repo.

- [ ] **Step 1: Add reference Firestore rules**

Create `firestore.rules`:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /artworks/{artworkId} {
      allow read: if true;
      allow create: if true;

      allow update: if request.auth != null
        && request.auth.token.email == 'admin@arma-christi.it'
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['visibility'])
        && request.resource.data.visibility in ['visible', 'hidden'];

      allow delete: if false;
    }
  }
}
```

Replace `admin@arma-christi.it` with the same email used in `PUBLIC_ADMIN_EMAIL`.

- [ ] **Step 2: Document setup in README**

Add section to `README.md`:

```markdown
## Admin moderation

1. Copy `.env.example` to `.env` and set `PUBLIC_ADMIN_EMAIL` to the shared admin account email.
2. In Firebase Console > Authentication, enable Email/Password and create one user with that email and the shared team password.
3. In Firebase Console > Firestore > Rules, paste `firestore.rules` (update the admin email if needed) and publish.
4. Open `/admin`, enter the shared password, and use gallery moderation controls.
```

- [ ] **Step 3: Commit**

```bash
git add firestore.rules README.md
git commit -m "docs: add firestore rules and admin setup notes"
```

---

### Task 6: Final verification

**Files:**
- Test: full suite

- [ ] **Step 1: Run full test suite**

Run:
```bash
npm run test:unit -- --run
npm run test:e2e
npm run check
npm run lint
```
Expected: PASS.

- [ ] **Step 2: Manual smoke test (local with `.env` configured)**

Run:
```bash
npm run dev
```

Checklist:
- Visit `/gallery` logged out → no admin bar, no action buttons.
- Visit `/admin` → wrong password shows "Password non corretta".
- Correct password → redirects to gallery with admin bar.
- Hide artwork → disappears from visitor view; visible with "Mostra anche i nascosti".
- Restore artwork → visible again to visitors.
- "Esci" → admin controls disappear.

- [ ] **Step 3: Commit if any fixups were needed**

```bash
git add -A
git commit -m "fix: address admin moderation verification issues"
```

(Skip commit if no fixups were needed.)

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Soft hide with restore | Task 1, 4 |
| `/admin` login page | Task 3 |
| Redirect to gallery after login | Task 3 |
| Shared password UX (no username) | Task 2, 3 |
| Protected auth (not in public code) | Task 2, 5 |
| Admin bar with toggle and exit | Task 4 |
| Hide/restore with confirm dialogs | Task 4 |
| Hidden styling (faded, label) | Task 4 |
| Visitors see only visible artworks | Task 1, 4 |
| Legacy artworks without field = visible | Task 1 |
| Error on failed hide/restore | Task 4 |
| Empty gallery message | Task 4 |
| Style consistent with existing pages | Task 3, 4 |
