import { FixedPerThermOffer, MarketOffer } from '../../entity/Offer';
import { Vendor } from '../../entity/Vendor';
import { Market } from '../data.current';

export const archerEnergy = new Vendor(
  'com.archerenergy',
  'Archer Energy, LLC',
  'https://www.archerenergy.com',
  '8447957451',
)
  /*
  id    name                          type    market  term  rate  confirmationCode
  fpt-1 Rate Lock                     fpt     -       1     0.489   91022
  fpt-2 Rate Lock                     fpt     -       2     0.519   91034
  idx-1 Pass Thru Index               market  CIG     1     0.139   91042
  idx-2 Pass Thru Index               market  CIG     2     0.139   91082
  green-fpt-1 GreenGas                fpt     -       1     0.499   91062
  green-fpt-2 GreenGas                fpt     -       2     0.529   91088
  fpm-1 Flat Bill                     fpm     -       1     0       -
  fpm-2 Flat Bill                     fpm     -       2     0       -
  */
  .addOffer({
    id: 'fpt-1',
    name: 'Rate Lock',
    type: 'fpt',
    term: 1,
    rate: 0.489,
    confirmationCode: '91022',
  })
  .addOffer({
    id: 'fpt-2',
    name: 'Rate Lock',
    type: 'fpt',
    term: 2,
    rate: 0.519,
    confirmationCode: '91034',
  })
  .addOffer({
    id: 'idx-1',
    name: 'Pass Thru Index',
    type: 'market',
    market: Market.CIG,
    term: 1,
    rate: 0.139,
    confirmationCode: '91042',
  })
  .addOffer({
    id: 'idx-2',
    name: 'Pass Thru Index',
    type: 'market',
    market: Market.CIG,
    term: 2,
    rate: 0.139,
    confirmationCode: '91082',
  })
  .addOffer({
    id: 'green-fpt-1',
    name: 'GreenGas',
    type: 'fpt',
    term: 1,
    rate: 0.499,
    confirmationCode: '91062',
  })
  .addOffer({
    id: 'green-fpt-2',
    name: 'GreenGas',
    type: 'fpt',
    term: 2,
    rate: 0.529,
    confirmationCode: '91088',
  })
  .addOffer({
    id: 'fpm-1',
    name: 'Flat Bill',
    type: 'fpm',
    term: 1,
    rate: 0,
  })

  // archerpro rates are 50/50
  .addOffer({
    id: 'archerpro-1',
    name: 'ArcherPro',
    type: 'blended',
    term: 1,
    confirmationCode: '91015',
    offers: [
      [
        6,
        {
          type: 'fpt',
          rate: 0.509,
        } as FixedPerThermOffer,
      ],
      [
        6,
        {
          type: 'market',
          market: Market.CIG,
          rate: 0.139,
        } as MarketOffer,
      ],
    ],
  })
  .addOffer({
    id: 'archerpro-2',
    name: 'ArcherPro',
    type: 'blended',
    term: 2,
    confirmationCode: '91031',
    offers: [
      [
        6,
        {
          type: 'fpt',
          rate: 0.539,
        } as FixedPerThermOffer,
      ],
      [
        6,
        {
          type: 'market',
          market: Market.CIG,
          rate: 0.139,
        } as MarketOffer,
      ],
    ],
  });
