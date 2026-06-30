export type ProcessionStopSide = 'left' | 'right' | 'center';

export interface ProcessionStopLinks {
	href?: string;
	text: string;
}

export interface ProcessionVenueStop {
	id: string;
	kind: 'venue';
	side: 'right' | 'center';
	label: string;
	title: string[];
	time: string;
	image: {
		src: string;
		alt: string;
	};
	footer?: {
		time: string;
		description: string;
		moderator: string;
	};
}

export interface ProcessionEntityStop {
	id: string;
	kind: 'entity';
	side: 'left' | 'right';
	title: string;
	subtitle: string;
	description: string;
	links: ProcessionStopLinks[];
	image?: {
		src: string;
		alt: string;
	};
	logo?: {
		src: string;
		alt: string;
	};
}

export type ProcessionStop = ProcessionVenueStop | ProcessionEntityStop;

export const PROCESSION_DATE = '— 19 / 09 / 2026';

export const PROCESSION_STOPS: ProcessionStop[] = [
	{
		id: 'partenza',
		kind: 'venue',
		side: 'right',
		label: 'PARTENZA:',
		title: ['Accademia', 'di Belle Arti', '"Pietro Vannucci"', 'di Perugia'],
		time: 'Ore: 18:00',
		image: {
			src: '/processione/partenza-accademia.webp',
			alt: 'Accademia di Belle Arti Pietro Vannucci di Perugia'
		}
	},
	{
		id: 'becoming-x',
		kind: 'entity',
		side: 'left',
		title: 'Becoming X',
		subtitle: 'Collettivo artistico',
		description:
			'Becoming X Art+Sound è un collettivo multidisciplinare che intreccia illustrazione, musica e performance audiovisiva. Attraverso il disegno dal vivo costruisce esperienze immersive e partecipative, superando i confini tra immagine, suono e narrazione.',
		links: [
			{ href: 'https://www.becomingxlivedrawing.it', text: 'www.becomingxlivedrawing.it' },
			{ href: 'https://www.instagram.com/becomingx_artsound', text: '@becomingx_artsound' }
		],
		image: {
			src: '/processione/becoming-x.webp',
			alt: 'Becoming X Art+Sound al lavoro su un murale'
		}
	},
	{
		id: 'mannaggia',
		kind: 'entity',
		side: 'right',
		title: 'Mannaggia',
		subtitle: 'Libreria indipendente',
		description:
			'Mannaggia — Libri da un altro mondo è una libreria indipendente di Perugia dedicata alla piccola e media editoria. Oltre a proporre libri di ricerca, promuove incontri, presentazioni e attività legate alla lettura e al confronto culturale.',
		links: [
			{ text: 'via Cartolari, 8 — Perugia' },
			{
				href: 'https://www.mannaggialibreria.sumupstore.com',
				text: 'www.mannaggialibreria.sumupstore.com'
			},
			{ href: 'https://www.instagram.com/mannaggialibreria', text: '@mannaggialibreria' }
		],
		image: {
			src: '/processione/mannaggia-libreria.webp',
			alt: 'Interno della libreria Mannaggia'
		}
	},
	{
		id: 'cronache-ribelli',
		kind: 'entity',
		side: 'left',
		title: 'Cronache Ribelli',
		subtitle: 'Editore indipendente',
		description:
			'Cronache Ribelli è un progetto editoriale indipendente che racconta la storia dal punto di vista delle classi popolari, delle minoranze e delle soggettività oppresse, intrecciando divulgazione storica, impegno civile e riflessione critica.',
		links: [
			{ href: 'https://www.cronacheribelli.it', text: 'www.cronacheribelli.it' },
			{ href: 'https://www.instagram.com/cronacheribelli', text: '@cronacheribelli' }
		],
		logo: {
			src: '/processione/cronache-ribelli-logo.svg',
			alt: 'Logo Cronache Ribelli'
		}
	},
	{
		id: 'arrivo',
		kind: 'venue',
		side: 'center',
		label: 'ARRIVO:',
		title: ['Piazza IV Novembre'],
		time: '',
		image: {
			src: '/processione/arrivo-piazza-iv-novembre.webp',
			alt: 'Piazza IV Novembre a Perugia'
		},
		footer: {
			time: 'Ore: 20:00',
			description:
				'Intervento pubblico delle realtà indipendenti coinvolte: Becoming X, Mannaggia — Libreria Indipendente, Cronache Ribelli.',
			moderator: 'Modera: Daniela Mancarella'
		}
	}
];
