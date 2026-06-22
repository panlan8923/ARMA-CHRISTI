<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAdminEmailHint, getAdminLoginErrorMessage, signInAdmin } from '$lib/auth';

	const adminEmailHint = getAdminEmailHint();

	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		loading = true;

		try {
			await signInAdmin(password);
			await goto(resolve('/gallery'));
		} catch (err) {
			console.error('Admin login failed:', err);
			error = getAdminLoginErrorMessage(err);
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
		{#if adminEmailHint}
			<p class="email-hint">Account: {adminEmailHint}</p>
		{:else}
			<p class="email-hint email-hint--missing">Account admin non configurato (.env)</p>
		{/if}
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

	<a class="home-link" href={resolve('/')}>Torna alla home</a>
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

	.email-hint {
		margin: 0;
		font-size: 13px;
		color: #aaaaaa;
	}

	.email-hint--missing {
		color: #ff8a8a;
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
