export type ArtworkVisibility = 'visible' | 'hidden';

export type ArtworkItem = {
	id: string;
	imageData: string;
	visibility: ArtworkVisibility;
};

export function mapArtworkDoc(
	id: string,
	data: Record<string, unknown>
): ArtworkItem | null {
	if (typeof data.imageData !== 'string' || data.imageData.length === 0) {
		return null;
	}

	const visibility = data.visibility === 'hidden' ? 'hidden' : 'visible';

	return {
		id,
		imageData: data.imageData,
		visibility
	};
}

export function filterArtworksForDisplay(
	items: ArtworkItem[],
	options: { isAdmin: boolean; showHidden: boolean }
): ArtworkItem[] {
	if (options.isAdmin && options.showHidden) {
		return items;
	}

	return items.filter((item) => item.visibility !== 'hidden');
}
