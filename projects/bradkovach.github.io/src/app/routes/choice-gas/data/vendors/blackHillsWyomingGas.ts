import type { AnyOffer } from '../../schema/offer.z';

import { Vendor } from '../../entity/Vendor';
import offers from './json/com.choicegas.json';

export const blackHillsWyomingGas = new Vendor(
	'com.choicegas',
	'Black Hills Wyoming Gas, LLC',
	'https://choicegas.com',
	'8772453506',
	true,
);

offers.forEach((offer) => {
	blackHillsWyomingGas.addOffer(offer as AnyOffer);
});
