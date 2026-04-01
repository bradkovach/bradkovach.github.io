import type { AnyOffer } from '../../schema/offer.z';

import { Vendor } from '../../entity/Vendor';
import offers from './json/org.wyomingcommunitygas.json';

export const wyomingCommunityGas = new Vendor(
	'org.wyomingcommunitygas',
	'Wyoming Community Gas',
	'https://wyomingcommunitygas.org',
	'8773184051',
	true,
);

for (const offer of offers as AnyOffer[]) {
	wyomingCommunityGas.addOffer(offer);
}
