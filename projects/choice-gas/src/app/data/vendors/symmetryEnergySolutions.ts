import type { AnyOffer } from '../../schema/offer.z';

import { Vendor } from '../../entity/Vendor';
import offers from './json/com.symmetryenergy.json';

export const symmetryEnergySolutions = new Vendor(
	'com.symmetryenergy',
	'Symmetry Energy Solutions',
	'https://symmetryenergy.com/choice',
	'8882003788',
	false,
);

for (const offer of offers as AnyOffer[]) {
	symmetryEnergySolutions.addOffer(offer);
}
