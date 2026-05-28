import { describe, expect, it } from 'vitest';
import { mapArtworkDoc } from './gallery';

describe('mapArtworkDoc', () => {
	it('returns null when imageData missing', () => {
		expect(mapArtworkDoc({})).toBeNull();
	});

	it('returns item when imageData is valid', () => {
		expect(mapArtworkDoc({ imageData: 'data:image/jpeg;base64,abc' })).toEqual({
			imageData: 'data:image/jpeg;base64,abc'
		});
	});
});
