import { MarketOffer } from '../../entity/Offer';
import { Vendor } from '../../entity/Vendor';
import { Market } from '../data.current';

export const wyomingProducerConsumerAlliance = new Vendor(
  'com.wp-ca',
  'Wyoming Producer-Consumer Alliance',
  'https://www.wp-ca.com/pricing',
  '8774389722',
)
  .addOffer({
    name: 'Market Index',
    term: 1,
    type: 'market',
    market: Market.CIG,
    rate: 0.155,
    id: '1-index',
    confirmationCode: '94005',
  })
  .addOffer({
    name: 'Fixed',
    term: 1,
    type: 'fpt',
    rate: 0.549,
    id: '1-fpt',
    confirmationCode: '94000',
  })
  .addOffer({
    name: 'Blended',
    term: 1,
    type: 'blended',
    id: '1-blended',
    offers: [
      [0.5, { type: 'fpt', rate: 0.549 }],
      [0.5, { type: 'market', rate: 0.155, market: Market.CIG } as MarketOffer],
    ],
    confirmationCode: '94015',
  })
  .addOffer({
    name: 'Index With A Cap',
    term: 1,
    type: 'best',
    id: '1-best',
    offers: [
      { type: 'fpt', rate: 0.589 },
      { type: 'market', rate: 0.185, market: Market.CIG } as MarketOffer,
    ],
    confirmationCode: '94010',
  })

  .addOffer({
    name: 'Market Index',
    term: 2,
    type: 'market',
    market: Market.CIG,
    rate: 0.155,
    id: '2-index',
    confirmationCode: '94025',
  })
  .addOffer({
    name: 'Fixed',
    term: 2,
    type: 'fpt',
    rate: 0.589,
    id: '2-fpt',
    confirmationCode: '94020',
  })
  .addOffer({
    name: 'Blended',
    term: 2,
    type: 'blended',
    id: '2-blended',
    offers: [
      [0.5, { type: 'fpt', rate: 0.629 }],
      [0.5, { type: 'market', rate: 0.175, market: Market.CIG } as MarketOffer],
    ],
    confirmationCode: '94035',
  })
  .addOffer({
    name: 'Index With A Cap',
    term: 2,
    type: 'best',
    id: '2-best',
    offers: [
      { type: 'fpt', rate: 0.619 },
      { type: 'market', rate: 0.185, market: Market.CIG } as MarketOffer,
    ],
    confirmationCode: '94030',
  });
