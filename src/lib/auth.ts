import { PUBLIC_ADMIN_EMAIL } from '$env/static/public';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '$lib/firebase';

const adminEmail = PUBLIC_ADMIN_EMAIL;

export function getAdminEmailHint(): string {
	return adminEmail ?? '';
}

export function getAdminEmail(): string {
	if (!adminEmail) {
		throw new Error('PUBLIC_ADMIN_EMAIL is not configured');
	}
	return adminEmail;
}

export function getAdminLoginErrorMessage(error: unknown): string {
	if (!adminEmail) {
		return 'Configurazione mancante: crea il file .env e riavvia il sito';
	}

	const code =
		error && typeof error === 'object' && 'code' in error
			? String((error as { code: string }).code)
			: '';

	switch (code) {
		case 'auth/invalid-credential':
		case 'auth/wrong-password':
		case 'auth/invalid-login-credentials':
			return 'Password non corretta';
		case 'auth/user-not-found':
			return 'Nessun admin con questa email. Controlla Firebase e il file .env';
		case 'auth/operation-not-allowed':
			return 'Login email/password non attivo su Firebase. Attivalo in Authentication > Sign-in method';
		case 'auth/too-many-requests':
			return 'Troppi tentativi. Riprova tra qualche minuto';
		case 'auth/network-request-failed':
			return 'Problema di connessione. Controlla internet e riprova';
		default:
			return 'Accesso non riuscito. Controlla password e impostazioni Firebase';
	}
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
