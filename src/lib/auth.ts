import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
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
