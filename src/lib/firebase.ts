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
