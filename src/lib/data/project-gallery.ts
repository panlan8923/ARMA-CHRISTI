export interface ProjectImage {
	id: '01' | '02' | '03' | '04';
	src: string;
	alt: string;
	title: string;
	artist: string;
	year: string;
	label: string;
}

export const PROJECT_IMAGES: ProjectImage[] = [
	{
		id: '01',
		src: '/progetto/fig-01-zebra-crossing.png',
		alt: 'Un attraversamento pedonale mobile viene disteso su una strada urbana mentre un gruppo di persone attraversa.',
		title: 'The Zebra Crossing',
		artist: 'Gerhard Lang',
		year: '1993.',
		label: 'Fig. 01'
	},
	{
		id: '02',
		src: '/progetto/fig-02-passeggiata-automobilisti.png',
		alt: 'Un gruppo di persone procede lungo una strada portando immagini incorniciate durante una passeggiata collettiva.',
		title: 'Passeggiata degli Automobilisti',
		artist: 'Lucius Burckhardt',
		year: '1996.',
		label: 'Fig. 02'
	},
	{
		id: '03',
		src: '/progetto/fig-03-wheat-and-steak.png',
		alt: 'Una parata urbana con performer che trasportano grandi sagome rosse ispirate a tagli di carne.',
		title: 'Wheat & Steak',
		artist: 'Antoni Miralda',
		year: '1981.',
		label: 'Fig. 03'
	},
	{
		id: '04',
		src: '/progetto/fig-04-modern-procession.png',
		alt: 'Una processione attraversa un ponte urbano trasportando una donna seduta e grandi bandiere colorate.',
		title: 'The Modern Procession',
		artist: 'Francis Alÿs',
		year: '2002.',
		label: 'Fig. 04'
	}
];

export const MOBILE_IMAGE_ORDER: ProjectImage['id'][] = ['01', '02', '03', '04'];

export function getProjectImageById(id: ProjectImage['id']): ProjectImage {
	const image = PROJECT_IMAGES.find((item) => item.id === id);
	if (!image) throw new Error(`Unknown project image id: ${id}`);
	return image;
}
