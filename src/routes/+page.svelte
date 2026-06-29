<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import HeroLogo from '$lib/components/HeroLogo.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';

	const CANVAS_FILL = '#2a2a2a';
	const LOSE_CONTROL_STROKE_SCALE = 0.35;

	let canvas: HTMLCanvasElement;
	let drawSection: HTMLElement;
	let drawArea: HTMLElement;
	let navGalleryBtn: HTMLAnchorElement;

	let drawing = false;
	let lastX = 0;
	let lastY = 0;
	let lastMouseX = 0;
	let lastMouseY = 0;
	let hasUnsavedChanges = false;
	let isSubmitting = false;

	let showGallery = $state(false);
	let hasStartedDrawing = $state(false);
	let submitLabel = $state('submit trace');
	let submitDisabled = $state(false);
	let loseControl = $state(false);

	function toggleLoseControl() {
		loseControl = !loseControl;
	}

	function resizeCanvas() {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		canvas.width = drawArea.clientWidth;
		canvas.height = drawArea.clientHeight;
		ctx.fillStyle = CANVAS_FILL;
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
		hasStartedDrawing = true;
		lastX = pos.x;
		lastY = pos.y;
		lastMouseX = pos.x;
		lastMouseY = pos.y;
		hasUnsavedChanges = true;
	}

	function stopDrawing(e?: MouseEvent | TouchEvent) {
		e?.preventDefault();
		drawing = false;
	}

	function draw(e: MouseEvent | TouchEvent) {
		if (!drawing) return;

		e.preventDefault();
		const pos = getPosition(e);
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const deltaX = pos.x - lastMouseX;
		const deltaY = pos.y - lastMouseY;
		lastMouseX = pos.x;
		lastMouseY = pos.y;

		const drawX = loseControl ? lastX - deltaX * LOSE_CONTROL_STROKE_SCALE : pos.x;
		const drawY = loseControl ? lastY - deltaY * LOSE_CONTROL_STROKE_SCALE : pos.y;

		const jitter = 10;
		const offsetX = (Math.random() - 0.5) * jitter;
		const offsetY = (Math.random() - 0.5) * jitter;

		ctx.strokeStyle = 'white';
		ctx.lineWidth = 12 + Math.random() * 14;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(lastX, lastY);
		ctx.lineTo(drawX + offsetX, drawY + offsetY);
		ctx.stroke();

		for (let i = 0; i < 8; i += 1) {
			ctx.beginPath();
			ctx.arc(
				drawX + (Math.random() - 0.5) * 24,
				drawY + (Math.random() - 0.5) * 24,
				Math.random() * 2,
				0,
				Math.PI * 2
			);
			ctx.fillStyle = 'rgba(255,255,255,0.08)';
			ctx.fill();
		}

		lastX = drawX;
		lastY = drawY;
	}

	function startDrawingTouch(e: TouchEvent) {
		e.preventDefault();
		startDrawing(e);
	}

	function drawTouch(e: TouchEvent) {
		e.preventDefault();
		draw(e);
	}

	function stopDrawingTouch(e: TouchEvent) {
		e.preventDefault();
		stopDrawing(e);
	}

	async function submitTrace() {
		if (isSubmitting) return;

		isSubmitting = true;
		submitDisabled = true;
		submitLabel = 'submitting...';

		try {
			const imageData = canvas.toDataURL('image/jpeg', 0.7);
			await addDoc(collection(db, 'artworks'), {
				imageData,
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

	function onGalleryClick(e: MouseEvent) {
		if (!hasUnsavedChanges) return;
		e.preventDefault();
		const message = isSubmitting
			? 'Submission is in progress. Are you sure you want to leave for the Gallery?'
			: 'You have an unsaved drawing. Are you sure you want to leave for the Gallery?';
		if (window.confirm(message)) {
			window.location.href = navGalleryBtn.href;
		}
	}

	onMount(() => {
		resizeCanvas();

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					showGallery = entry.isIntersecting;
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(drawSection);
		window.addEventListener('resize', resizeCanvas);
		navGalleryBtn.addEventListener('click', onGalleryClick);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', resizeCanvas);
			navGalleryBtn.removeEventListener('click', onGalleryClick);
		};
	});
</script>

<svelte:head>
	<title>ARMA CHRISTI</title>
</svelte:head>

<SiteNav current="home" layout="viewport" />

<header class="hero">
	<HeroLogo />
	<p class="hero__tagline">Scopri le realtà indipendenti di Perugia</p>
	<div class="hero__scroll-hint" aria-hidden="true">
		<span class="hero__scroll-label">inizia</span>
		<span class="hero__scroll-arrow">↓</span>
	</div>
</header>

<section id="drawSection" class="draw-section" bind:this={drawSection}>
	<div class="draw-area" bind:this={drawArea}>
		<canvas
			id="draw"
			bind:this={canvas}
			onmousedown={startDrawing}
			onmousemove={draw}
			onmouseup={stopDrawing}
			onmouseleave={stopDrawing}
			ontouchstart={startDrawingTouch}
			ontouchmove={drawTouch}
			ontouchend={stopDrawingTouch}
			ontouchcancel={stopDrawingTouch}
		></canvas>
		<p
			class="draw-placeholder"
			class:draw-placeholder--hidden={hasStartedDrawing}
			aria-hidden={hasStartedDrawing}
		>
			Lascia il tuo segno
		</p>
		<div class="draw-actions">
			<button
				type="button"
				class="draw-action-btn"
				class:draw-action-btn--active={loseControl}
				onclick={toggleLoseControl}
			>
				lose control
			</button>
			<button
				id="submitBtn"
				class="draw-action-btn"
				onclick={submitTrace}
				disabled={submitDisabled}
			>
				{submitLabel}
			</button>
		</div>
	</div>
</section>

<a
	id="navGallery"
	class={`navBtn ${showGallery ? 'visible' : ''}`}
	href={resolve('/gallery')}
	bind:this={navGalleryBtn}
>
	Gallery
</a>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		background: black;
		color: #cccccc;
		overflow-x: hidden;
	}

	.hero {
		box-sizing: border-box;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px 40px;
		text-align: center;
	}

	.hero__tagline {
		margin: 28px 0 0;
		max-width: 28em;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 2px;
		line-height: 1.5;
		text-transform: uppercase;
		color: #999999;
	}

	.hero__scroll-hint {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		margin-top: 56px;
	}

	.hero__scroll-label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		text-transform: lowercase;
		color: #666666;
	}

	.hero__scroll-arrow {
		font-size: 1.25rem;
		line-height: 1;
		color: #666666;
	}

	.draw-section {
		box-sizing: border-box;
		width: 100%;
		height: 100vh;
		height: 100dvh;
		padding: 32px;
		display: flex;
	}

	.draw-area {
		position: relative;
		flex: 1;
		min-height: 0;
		border-radius: 16px;
		overflow: hidden;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
		touch-action: none;
	}

	.draw-placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		padding: 0 24px;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 2px;
		line-height: 1.5;
		text-transform: uppercase;
		color: #aaaaaa;
		pointer-events: none;
		opacity: 1;
		transition: opacity 0.4s ease;
	}

	.draw-placeholder--hidden {
		opacity: 0;
	}

	.draw-actions {
		position: absolute;
		left: 50%;
		bottom: 32px;
		transform: translateX(-50%);
		z-index: 1;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
	}

	.draw-action-btn {
		background: white;
		color: black;
		border: none;
		border-radius: 999px;
		padding: 16px 34px;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 2px;
		text-transform: uppercase;
		cursor: pointer;
	}

	.draw-action-btn--active {
		background: black;
		color: white;
		outline: 2px solid white;
	}

	.draw-action-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.navBtn {
		position: fixed;
		top: 20px;
		right: 20px;
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
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.3s ease;
	}

	.navBtn.visible {
		opacity: 1;
		pointer-events: auto;
	}
</style>
