/** Desktop layout coordinates from Figma frame "Percorso" (node 17:176), 1280 px wide. */

export const DESKTOP_FRAME_WIDTH = 1280;
export const DESKTOP_FRAME_HEIGHT = 3753;

export const DESKTOP_NAV = {
	top: 20,
	width: 1180,
	height: 65
} as const;

export const DESKTOP_HERO = {
	title: { top: 118, left: 50, width: 337, height: 250 },
	date: { top: 399, left: 130 }
} as const;

export const DESKTOP_PATH = {
	top: 404,
	width: 313,
	height: 2567.5
} as const;

export const DESKTOP_GRID_MARKS = [
	{ left: 31, top: 182 },
	{ left: 621, top: 182 },
	{ left: 1211, top: 182 },
	{ left: 31, top: 771 },
	{ left: 621, top: 771 },
	{ left: 1211, top: 771 },
	{ left: 31, top: 1360 },
	{ left: 621, top: 1360 },
	{ left: 1211, top: 1360 },
	{ left: 31, top: 1949 },
	{ left: 621, top: 1949 },
	{ left: 1211, top: 1949 },
	{ left: 31, top: 2538 },
	{ left: 621, top: 2538 },
	{ left: 1211, top: 2538 },
	{ left: 31, top: 3127 },
	{ left: 621, top: 3127 },
	{ left: 1211, top: 3127 },
	{ left: 31, top: 3716 },
	{ left: 621, top: 3716 },
	{ left: 1211, top: 3716 }
] as const;

/** Figma node frames (20×20) with 27×27 visual asset centered on each. */
export const DESKTOP_NODES = [
	{ id: 'step-01', left: 472.5, top: 380.5 },
	{ id: 'step-02', left: 781.5, top: 1348.5 },
	{ id: 'step-03', left: 472.5, top: 1933.5 },
	{ id: 'step-04', left: 781.5, top: 2504.5 },
	{ id: 'step-05', left: 624.5, top: 2963.5 }
] as const;

export const DESKTOP_NODE_SIZE = 27;

export const DESKTOP_CRONACHE_LOGO = {
	left: 'calc(50% - 75.5px)',
	top: 'calc(50% + 608.41px)',
	width: 313,
	height: 215.81
} as const;

export const PROCESSION_UI = {
	gridCross: '/processione/ui/grid-cross.svg',
	arrow: '/processione/ui/procession-arrow.svg',
	node: '/processione/ui/procession-node.svg'
} as const;
