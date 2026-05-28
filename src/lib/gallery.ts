export type ArtworkItem = {
	imageData: string;
};

export function mapArtworkDoc(data: Record<string, unknown>): ArtworkItem | null {
	if (typeof data.imageData !== 'string' || data.imageData.length === 0) {
		return null;
	}

	return {
		imageData: data.imageData
	};
}
