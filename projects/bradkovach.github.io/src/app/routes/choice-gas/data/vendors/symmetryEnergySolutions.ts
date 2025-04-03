import type { Offer } from '../../entity/Offer';

import { Vendor } from '../../entity/Vendor';
import offers from './json/com.symmetryenergy.json';

export const symmetryEnergySolutions = new Vendor(
	'com.symmetryenergy',
	'Symmetry Energy Solutions',
	'https://symmetryenergy.com/choice',
	'8882003788',
	true,
);

for (const offer of offers as Offer[]) {
	symmetryEnergySolutions.addOffer(offer);
}
