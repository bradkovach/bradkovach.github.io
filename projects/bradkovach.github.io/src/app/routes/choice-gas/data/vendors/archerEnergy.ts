import { Offer } from '../../entity/Offer';
import { Vendor } from '../../entity/Vendor';

import offers from './json/com.archerenergy.json';

export const archerEnergy = new Vendor(
	'com.archerenergy',
	'Archer Energy, LLC',
	'https://www.archerenergy.com',
	'8447957451',
	true,
);

for (const offer of offers as Offer[]) {
	archerEnergy.addOffer(offer);
}
