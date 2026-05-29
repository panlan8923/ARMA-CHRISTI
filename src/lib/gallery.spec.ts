import { describe, expect, it } from 'vitest';
import { filterArtworksForDisplay, mapArtworkDoc, type ArtworkItem } from './gallery';

const sample: ArtworkItem = {
	id: 'abc',
	imageData: 'data:image/jpeg;base64,abc',
	visibility: 'visible'
};

describe('mapArtworkDoc', () => {
	it('returns null when imageData missing', () => {
		expect(mapArtworkDoc('doc1', {})).toBeNull();
	});

	it('returns item when imageData is valid', () => {
		expect(mapArtworkDoc('doc1', { imageData: 'data:image/jpeg;base64,abc' })).toEqual({
			id: 'doc1',
			imageData: 'data:image/jpeg;base64,abc',
			visibility: 'visible'
		});
	});

	it('maps hidden visibility when present', () => {
		expect(
			mapArtworkDoc('doc2', { imageData: 'data:image/jpeg;base64,abc', visibility: 'hidden' })
		).toEqual({
			id: 'doc2',
			imageData: 'data:image/jpeg;base64,abc',
			visibility: 'hidden'
		});
	});
});

describe('filterArtworksForDisplay', () => {
	const visible = { ...sample, id: 'v', visibility: 'visible' as const };
	const hidden = { ...sample, id: 'h', visibility: 'hidden' as const };
	const items = [visible, hidden];

	it('hides hidden items for visitors', () => {
		expect(filterArtworksForDisplay(items, { isAdmin: false, showHidden: false })).toEqual([
			visible
		]);
	});

	it('hides hidden items for admin when toggle is off', () => {
		expect(filterArtworksForDisplay(items, { isAdmin: true, showHidden: false })).toEqual([
			visible
		]);
	});

	it('shows all items for admin when toggle is on', () => {
		expect(filterArtworksForDisplay(items, { isAdmin: true, showHidden: true })).toEqual(items);
	});
});
