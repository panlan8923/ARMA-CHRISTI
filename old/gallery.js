import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';

import {
	getFirestore,
	collection,
	getDocs,
	query,
	orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

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

const db = getFirestore(app);

const gallery = document.getElementById('gallery');

async function loadArtworks() {
	const q = query(collection(db, 'artworks'), orderBy('createdAt', 'desc'));

	const snapshot = await getDocs(q);

	snapshot.forEach((doc) => {
		const data = doc.data();

		const div = document.createElement('div');

		div.className = 'artwork';

		const img = document.createElement('img');

		img.src = data.imageData;

		div.appendChild(img);

		gallery.appendChild(div);
	});
}

loadArtworks();
