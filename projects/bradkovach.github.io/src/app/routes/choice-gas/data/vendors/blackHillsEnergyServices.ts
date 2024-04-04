import { FixedPerThermOffer, MarketOffer } from '../../entity/Offer';
import { Vendor } from '../../entity/Vendor';
import { Market } from '../data.current';
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
)
  /*
  bl-1  Blended                       blended         1            12265
                                      fpt                   0.45
                                      market  CIG           0.112
  bl-2  Blended                       blended         2            12266
                                      fpt                   0.478
                                      market  CIG           0.113
  */
  .addOffer({
    id: 'bl-1',
    name: 'Blended',
    type: 'blended',
    term: 1,
    offers: [
      [0.5, { type: 'fpt', rate: 0.45 } as FixedPerThermOffer],
      [0.5, { type: 'market', market: Market.CIG, rate: 0.112 } as MarketOffer],
    ],
    confirmationCode: '12265',
  })
  .addOffer({
    id: 'bl-2',
    name: 'Blended',
    type: 'blended',
    term: 2,
    offers: [
      [0.5, { type: 'fpt', rate: 0.478 } as FixedPerThermOffer],
      [0.5, { type: 'market', market: Market.CIG, rate: 0.113 } as MarketOffer],
    ],
    confirmationCode: '12266',
  })
  .addOffer({
    id: 'fpt-1',
    name: 'Fixed 1 Year',
    type: 'fpt',
    term: 1,
    rate: 0.45,
    confirmationCode: '12003',
  })
  .addOffer({
    id: 'fpt-2',
    name: 'Fixed 2 Year',
    type: 'fpt',
    term: 2,
    rate: 0.46,
    confirmationCode: '12128',
  })
  .addOffer({
    id: 'fpm-1',
    name: 'WinterGuard',
    type: 'fpm',
    term: 1,
    rate: 0,
    confirmationCode: '13900',
  })
  .addOffer({
    id: 'fpm-2',
    name: 'WinterGuard',
    type: 'fpm',
    term: 2,
    rate: 0,
    confirmationCode: '13926',
  })
  .addOffer({
    id: 'cig-1',
    name: 'Index 1 Year',
    type: 'market',
    market: Market.CIG,
    term: 1,
    rate: 0.112,
    confirmationCode: '12192',
  })
  .addOffer({
    id: 'cig-2',
    name: 'Index 2 Year',
    type: 'market',
    market: Market.CIG,
    term: 2,
    rate: 0.113,
    confirmationCode: '12178',
  });
