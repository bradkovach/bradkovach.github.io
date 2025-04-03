import type { Offer } from '../../entity/Offer';

import { Vendor } from '../../entity/Vendor';
import offers from './json/com.woodriverenergy.json';

export const woodRiverEnergy = new Vendor(
	'com.woodriverenergy',
	'WoodRiver Energy, LLC',
	'https://www.woodriverenergy.com',
	'8777904990',
	true,
);

for (const offer of offers as Offer[]) {
	woodRiverEnergy.addOffer(offer);
}
