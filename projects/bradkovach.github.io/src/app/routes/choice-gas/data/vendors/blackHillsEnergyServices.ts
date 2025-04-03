import type { Offer } from '../../entity/Offer';

import { Vendor } from '../../entity/Vendor';
import offers from './json/com.choosebhes.json';
/*
id    name                          type    market  term  rate  confirmationCode
fpt-1 Fixed 1 Year                  fpt     1       1     0.45  12003
fpt-2 Fixed 2 Year                  fpt     1       2     0.46  12128
fpm-1 WinterGuard                   fpm     1       0     0     13900
fpm-2 WinterGuard                   fpm     1       0     0     13926
cig-1 Index 1 Year                  market  CIG     1     0.112  12192
cig-2 Index 2 Year                  market  CIG     2     0.113  12178
*/
export const blackHillsEnergyServices = new Vendor(
	'com.choosebhes',
	'Black Hills Energy Services',
	'https://www.choosebhes.com',
	'8662313241',
	true,
);

for (const offer of offers as Offer[]) {
	blackHillsEnergyServices.addOffer(offer);
}
