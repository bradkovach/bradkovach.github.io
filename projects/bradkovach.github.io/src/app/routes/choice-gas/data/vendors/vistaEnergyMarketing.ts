import type { Offer } from '../../entity/Offer';

import { Vendor } from '../../entity/Vendor';
import offers from './json/com.vistaenergymarketing.json';

export const vistaEnergyMarketing = new Vendor(
	'com.vistaenergymarketing',
	'Vista Energy Marketing',
	'https://vistaenergymarketing.com',
	'8885084782',
	true,
);

for (const offer of offers as Offer[]) {
	vistaEnergyMarketing.addOffer(offer);
}
