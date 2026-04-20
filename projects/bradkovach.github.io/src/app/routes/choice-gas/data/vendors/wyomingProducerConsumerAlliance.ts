import type { Offer } from '../../entity/Offer';

import offers from './json/com.wp-ca.json';
import { Vendor } from '../../entity/Vendor';

export const wyomingProducerConsumerAlliance = new Vendor(
	'com.wp-ca',
	'Wyoming Producer-Consumer Alliance',
	'https://www.wp-ca.com/pricing',
	'8774389722',
	true,
);

for (const offer of offers as Offer[]) {
	wyomingProducerConsumerAlliance.addOffer(offer);
}
//   .addOffer({
//     name: 'Market Index',
//     term: 1,
//     type: 'market',
//     market: Market.CIG,
//     rate: 0.145,
//     id: '1-index',
//     confirmationCode: '94025',
//   })
//   .addOffer({
//     name: 'Fixed',
//     term: 1,
//     type: 'fpt',
//     rate: 0.549,
//     id: '1-fpt',
//     confirmationCode: '94024',
//   })
//   .addOffer({
//     name: 'Blended',
//     term: 1,
//     type: 'blended',
//     id: '1-blended',
//     offers: [
//       [0.5, { type: 'fpt', rate: 0.515 }],
//       [0.5, { type: 'market', rate: 0.145, market: Market.CIG } as MarketOffer],
//     ],
//     confirmationCode: '94057',
//   })
//   .addOffer({
//     name: 'Index With A Cap',
//     term: 1,
//     type: 'best',
//     id: '1-best',
//     offers: [
//       { type: 'fpt', rate: 0.545 },
//       { type: 'market', rate: 0.145, market: Market.CIG } as MarketOffer,
//     ],
//     confirmationCode: '94034',
//   })

//   .addOffer({
//     name: 'Market Index',
//     term: 2,
//     type: 'market',
//     market: Market.CIG,
//     rate: 0.145,
//     id: '2-index',
//     confirmationCode: '94094',
//   })
//   .addOffer({
//     name: 'Fixed',
//     term: 2,
//     type: 'fpt',
//     rate: 0.525,
//     id: '2-fpt',
//     confirmationCode: '94040',
//   })
//   .addOffer({
//     name: 'Blended',
//     term: 2,
//     type: 'blended',
//     id: '2-blended',
//     offers: [
//       [0.5, { type: 'fpt', rate: 0.545 }],
//       [0.5, { type: 'market', rate: 0.145, market: Market.CIG } as MarketOffer],
//     ],
//     confirmationCode: '94103',
//   })
//   .addOffer({
//     name: 'Index With A Cap',
//     term: 2,
//     type: 'best',
//     id: '2-best',
//     offers: [
//       { type: 'fpt', rate: 0.575 },
//       { type: 'market', rate: 0.145, market: Market.CIG } as MarketOffer,
//     ],
//     confirmationCode: '94050',
//   });
