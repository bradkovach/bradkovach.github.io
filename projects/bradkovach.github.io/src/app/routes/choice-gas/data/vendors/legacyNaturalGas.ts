import type { AnyOffer } from '../../schema/offer.z';

import { Vendor } from '../../entity/Vendor';
import offers from './json/com.legacynaturalgas.www.json';

export const legacyNaturalGas = new Vendor(
	'com.legacynaturalgas.www',
	'Legacy Natural Gas',
	'https://www.legacynaturalgas.com',
	'8884528231',
	true,
);

for (const offer of offers as AnyOffer[]) {
	legacyNaturalGas.addOffer(offer);
}
