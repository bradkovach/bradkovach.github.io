import { Vendor } from '../../entity/Vendor';
import { Market } from '../data.current';

export const woodRiverEnergy = new Vendor(
  'com.woodriverenergy',
  'WoodRiver Energy, LLC',
  'https://www.woodriverenergy.com',
  '8777904990',
)
  .addOffer({
    id: 'fpt-1',
    name: 'Guaranteed Fixed Price',
    rate: 0.442,
    type: 'fpt',
    term: 1,
  })
  .addOffer({
    id: 'fpt-2',
    name: 'Guaranteed Fixed Price',
    rate: 0.471,
    type: 'fpt',
    term: 2,
  })
  .addOffer({
    id: 'index-1',
    name: 'Guaranteed Index',
    type: 'market',
    market: Market.CIG,
    term: 1,
    rate: 0.078,
  })
  .addOffer({
    id: 'index-2',
    name: 'Guaranteed Index',
    type: 'market',
    market: Market.CIG,
    term: 2,
    rate: 0.078,
  })
  .addOffer({
    id: 'fpm-1',
    name: 'Secure Fixed Price',
    type: 'fpm',
    term: 1,
    rate: 91.2,
  })
  .addOffer({
    id: 'fpm-2',
    name: 'Secure Fixed Price',
    type: 'fpm',
    term: 2,
    rate: 93.9,
  });
