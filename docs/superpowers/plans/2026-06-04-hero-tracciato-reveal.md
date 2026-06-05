# Hero tracciato reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static hero `lettering.svg` image with an inline `arma-christi.svg` logo whose `#tracciato` mask path is animated via Anime.js v4 `createDrawable`, revealing the full lettering after a 500 ms pause over ~2.8 s.

**Architecture:** Restructure the SVG asset once (ghost layer + mask + shared path definition). `HeroLogo.svelte` owns inline SVG markup, mount-time animation, and `prefers-reduced-motion` fallback. Timing constants and reduced-motion detection live in `hero-logo-animation.ts` for unit tests. Home route swaps `<img>` for `<HeroLogo />` only.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, Anime.js v4 (`animejs` + `animejs/svg`), Vitest (node), Playwright e2e.

**Design spec:** `docs/superpowers/specs/2026-06-04-hero-tracciato-reveal-design.md`

---

## File structure and responsibilities

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Add `animejs` dependency |
| `src/lib/assets/arma-christi.svg` | Modify | Transparent background; `#scritta-arma` in `<defs>`; `#tracciato` in mask; ghost + reveal `<use>` layers |
| `src/lib/hero-logo-animation.ts` | Modify | Timing constants (`GHOST_OPACITY = 0.15`), draw endpoints, `prefersReducedMotion()` |
| `src/lib/hero-logo-animation.spec.ts` | Modify | Unit tests for animation helpers |
| `src/lib/components/HeroLogo.svelte` | Modify | Inline SVG + Anime.js `createDrawable` on `#tracciato` + a11y |
| `src/app.d.ts` | Modify | `*.svg?raw` module declaration |
| `src/routes/+page.svelte` | Modify | Import `HeroLogo`, replace `<img class="hero__logo">` |
| `src/routes/arma-christi.e2e.ts` | Modify | Assert hero logo via `role="img"` |

---

### Task 1: Add Anime.js v4

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install Anime.js**

Run:

```bash
npm install animejs
```

Expected: `package.json` lists `"animejs"` under `dependencies` and install exits 0.

- [ ] **Step 2: Verify TypeScript resolves SVG helpers**

Run:

```bash
npm run check
```

Expected: PASS (no new type errors from the dependency).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add animejs for hero logo draw animation"
```

---

### Task 2: Animation helpers (TDD)

**Files:**

- Modify: `src/lib/hero-logo-animation.ts`
- Modify: `src/lib/hero-logo-animation.spec.ts`
- Test: `src/lib/hero-logo-animation.spec.ts`

- [ ] **Step 1: Write the failing tests**

Replace `src/lib/hero-logo-animation.spec.ts` with:

```ts
import { describe, expect, it } from 'vitest';
import {
	DRAW_DURATION_MS,
	DRAW_EASE,
	DRAW_START_DELAY_MS,
	GHOST_OPACITY,
	getFinalDraw,
	getInitialDraw,
	prefersReducedMotion
} from './hero-logo-animation';

describe('hero-logo-animation', () => {
	it('exports spec timing values', () => {
		expect(DRAW_START_DELAY_MS).toBe(500);
		expect(DRAW_DURATION_MS).toBe(2800);
		expect(DRAW_EASE).toBe('inOutQuad');
		expect(GHOST_OPACITY).toBe(0.15);
	});

	it('returns draw endpoints', () => {
		expect(getInitialDraw()).toBe('0 0');
		expect(getFinalDraw()).toBe('0 1');
	});

	it('detects reduced motion from media query', () => {
		const matchMedia = (matches: boolean) =>
			({ matches }) as Pick<MediaQueryList, 'matches'>;

		expect(prefersReducedMotion(matchMedia(true))).toBe(true);
		expect(prefersReducedMotion(matchMedia(false))).toBe(false);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit -- src/lib/hero-logo-animation.spec.ts --run
```

Expected: FAIL — `GHOST_OPACITY` is `0.4`, expected `0.15`.

- [ ] **Step 3: Write minimal implementation**

Replace `src/lib/hero-logo-animation.ts` with:

```ts
export const DRAW_START_DELAY_MS = 500;
export const DRAW_DURATION_MS = 2800;
export const DRAW_EASE = 'inOutQuad';
export const GHOST_OPACITY = 0.15;

export function getInitialDraw(): `${number} ${number}` {
	return '0 0';
}

export function getFinalDraw(): `${number} ${number}` {
	return '0 1';
}

export function prefersReducedMotion(
	query: Pick<MediaQueryList, 'matches'> = window.matchMedia('(prefers-reduced-motion: reduce)')
): boolean {
	return query.matches;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test:unit -- src/lib/hero-logo-animation.spec.ts --run
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/hero-logo-animation.ts src/lib/hero-logo-animation.spec.ts
git commit -m "feat: align hero logo animation timing with approved spec"
```

---

### Task 3: Restructure SVG asset

**Files:**

- Modify: `src/lib/assets/arma-christi.svg`

**Source paths in the current file (do not alter `d` values):**

- Lettering: `#arma-christi_2` (long path inside the existing mask)
- Trace: `#tracciato` (stroke path inside the masked group)

- [ ] **Step 1: Apply structural edits**

Restructure `src/lib/assets/arma-christi.svg` to match this skeleton. Copy each `d` attribute **byte-identical** from the current file:

```xml
<svg width="591" height="493" viewBox="0 0 591 493" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
  <path id="scritta-arma" d="[copy d from #arma-christi_2 unchanged]" fill="#CCCCCC"/>
  <mask id="mask0_107_15" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="7" y="5" width="574" height="468">
    <path id="tracciato" d="[copy d from #tracciato unchanged]" stroke="#CCCCCC" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </mask>
</defs>
<g id="arma-christi">
  <g id="hero-logo-ghost" opacity="0.15" aria-hidden="true">
    <use href="#scritta-arma"/>
  </g>
  <g id="hero-logo-reveal" mask="url(#mask0_107_15)">
    <use href="#scritta-arma"/>
  </g>
</g>
</svg>
```

Required edits:

1. **Delete** `<rect width="591" height="493" fill="white"/>` — transparent background.
2. **Rename** lettering path to `#scritta-arma` with `fill="#CCCCCC"` (was white inside luminance mask).
3. **Move** `#tracciato` into the mask definition; keep `id="tracciato"` (not `tracciato-sopra`).
4. **Change** mask to `mask-type:alpha` (was luminance).
5. **Add** ghost and reveal groups using `<use href="#scritta-arma"/>`.

- [ ] **Step 2: Visual sanity check**

Run:

```bash
npm run dev
```

Temporarily render the SVG (e.g. via `HeroLogo` once wired, or open the file in a browser).

Expected: faint full `#CCCCCC` lettering visible at ~15%; no white rectangle on black background.

- [ ] **Step 3: Commit**

```bash
git add src/lib/assets/arma-christi.svg
git commit -m "refactor: structure arma-christi svg for hero reveal layers"
```

---

### Task 4: HeroLogo component with createDrawable

**Files:**

- Modify: `src/lib/components/HeroLogo.svelte`
- Modify: `src/app.d.ts`

- [ ] **Step 1: Update HeroLogo.svelte**

Replace `src/lib/components/HeroLogo.svelte` with:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'animejs';
	import { createDrawable } from 'animejs/svg';
	import armaChristiMarkup from '$lib/assets/arma-christi.svg?raw';
	import {
		DRAW_DURATION_MS,
		DRAW_EASE,
		DRAW_START_DELAY_MS,
		GHOST_OPACITY,
		getFinalDraw,
		getInitialDraw,
		prefersReducedMotion
	} from '$lib/hero-logo-animation';

	let root: HTMLDivElement;
	let ghostEl: SVGGElement | null = null;

	onMount(() => {
		const trace = root.querySelector<SVGPathElement>('#tracciato');
		if (!trace) return;

		ghostEl = root.querySelector<SVGGElement>('#hero-logo-ghost');

		const [drawable] = createDrawable(trace);

		if (prefersReducedMotion()) {
			drawable.setAttribute('draw', getFinalDraw());
			if (ghostEl) ghostEl.style.opacity = '0';
			return;
		}

		drawable.setAttribute('draw', getInitialDraw());
		if (ghostEl) ghostEl.style.opacity = String(GHOST_OPACITY);

		const ghostFade = ghostEl
			? animate(ghostEl, {
					opacity: 0,
					duration: DRAW_DURATION_MS,
					ease: DRAW_EASE,
					delay: DRAW_START_DELAY_MS
				})
			: null;

		const traceDraw = animate(drawable, {
			draw: getFinalDraw(),
			duration: DRAW_DURATION_MS,
			ease: DRAW_EASE,
			delay: DRAW_START_DELAY_MS
		});

		return () => {
			traceDraw.pause();
			ghostFade?.pause();
		};
	});
</script>

<div
	class="hero-logo"
	style:--hero-ghost-opacity={GHOST_OPACITY}
	bind:this={root}
	role="img"
	aria-label="ARMA CHRISTI"
>
	{@html armaChristiMarkup}
</div>

<style>
	.hero-logo {
		display: block;
		width: min(680px, 90vw);
		max-height: 58vh;
		line-height: 0;
	}

	.hero-logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
		max-height: 58vh;
	}

	.hero-logo :global(#hero-logo-ghost) {
		opacity: var(--hero-ghost-opacity, 0.15);
	}
</style>
```

- [ ] **Step 2: Add Vite raw import typing**

Append to `src/app.d.ts`:

```ts
declare module '*.svg?raw' {
	const content: string;
	export default content;
}
```

- [ ] **Step 3: Run check**

Run:

```bash
npm run check
```

Expected: PASS.

- [ ] **Step 4: Manual smoke in browser**

Run:

```bash
npm run dev
```

Open `/` (after Task 5 wires the component). Expected sequence:

- ~0.5 s faint lettering only (~15%)
- ~2.8 s reveal along trace
- final state: full `#CCCCCC` lettering, ghost faded out

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/HeroLogo.svelte src/app.d.ts
git commit -m "feat: animate hero logo reveal via createDrawable on tracciato"
```

---

### Task 5: Wire Home hero

**Files:**

- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Replace static img with HeroLogo**

In `src/routes/+page.svelte`:

1. Add import:

```ts
import HeroLogo from '$lib/components/HeroLogo.svelte';
```

2. Remove `base` from the `$app/paths` import if it is only used by the hero `<img>`.

3. Replace the hero logo block:

```svelte
<header class="hero">
	<HeroLogo />
	<p class="hero__tagline">Scopri le realtà indipendenti di Perugia</p>
	<div class="hero__scroll-hint" aria-hidden="true">
		<span class="hero__scroll-label">inizia</span>
		<span class="hero__scroll-arrow">↓</span>
	</div>
</header>
```

4. Remove `.hero__logo` rules from `<style>`. Keep `.hero` layout rules unchanged.

- [ ] **Step 2: Run check**

```bash
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "feat: use animated HeroLogo in home hero"
```

---

### Task 6: E2E smoke test update

**Files:**

- Modify: `src/routes/arma-christi.e2e.ts`

- [ ] **Step 1: Assert hero logo presence**

Update the `home shows draw UI` test:

```ts
test('home shows draw UI', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('img', { name: 'ARMA CHRISTI' })).toBeVisible();
	await expect(page.locator('#draw')).toBeVisible();
	await expect(page.getByRole('button', { name: 'submit trace' })).toBeVisible();
	await expect(page.getByText('Scopri le realtà indipendenti di Perugia')).toBeVisible();
});
```

- [ ] **Step 2: Run e2e**

```bash
npm run test:e2e -- src/routes/arma-christi.e2e.ts
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/routes/arma-christi.e2e.ts
git commit -m "test: assert animated hero logo is visible on home"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npm run test
```

Expected: unit + e2e PASS.

- [ ] **Step 2: Acceptance checklist (manual)**

| # | Criterion | How to verify |
|---|-----------|---------------|
| 1 | Faint lettering → pause → reveal ~2.5–3 s | Watch `/` load |
| 2 | Final lettering static and readable | Wait for animation end |
| 3 | No white box around logo | Black hero background |
| 4 | Mobile width OK | DevTools narrow viewport |
| 5 | Reduced motion shows final immediately | OS “reduce motion” on, reload |
| 6 | No `lettering.svg` in hero | Inspect hero DOM: inline SVG only |

- [ ] **Step 3: If mask + draw fails in a browser**

Fallback: clone `#tracciato` inside the mask with `id="tracciato-draw"`, run `createDrawable` on the clone, keep the original path static. Document result in commit message.

---

## Spec coverage (self-review)

| Spec requirement | Plan task |
|------------------|-----------|
| Mask reveal via `#tracciato` | Task 3–4 (`createDrawable` on mask path) |
| 500 ms delay, ~2.8 s duration | Task 2 constants, Task 4 animation |
| Ghost ~15% initial | Task 2–3 `hero-logo-ghost`, Task 4 fade |
| Fluid easing (`inOutQuad`) | Task 2 + Task 4 |
| No loop | Task 4 single `animate` call |
| Replace `lettering.svg` in hero | Task 5 |
| Transparent SVG background | Task 3 |
| `prefers-reduced-motion` | Task 2 + Task 4 |
| Inline SVG (not `<img>`) | Task 4–5 |
| E2E / verification | Task 6–7 |

## Risks

- **Mask + `createDrawable`:** validate in Chromium first; Task 7 documents fallback.
- **Large path + thick stroke:** acceptable for one-shot mount animation per spec.
- **`{@html}` SVG:** single hero instance on page; IDs stable.
