import { Vendor } from '../../entity/Vendor';
import { Market } from '../data.current';

export const uncleFrankEnergyServices = new Vendor(
  'com.unclefrankenergy',
  'Uncle Frank Energy Services',
  'https://www.unclefrankenergy.com',
  '8333726564',
)
  .addOffer({
    id: 'index-1',
    name: 'Variable Index Adder',
    type: 'market',
    market: Market.CIG,
    term: 1,
    rate: 0.3,
    confirmationCode: '10500',
  })
  .addOffer({
    id: 'green-index-1',
    name: 'Variable Green Index Adder',
    type: 'market',
    market: Market.CIG,
    term: 1,
    rate: 0.4,
    confirmationCode: '10501',
  })
  .addOffer({
    id: 'fpt-1',
    name: 'Fixed 1 Year',
    type: 'fpt',
    term: 1,
    rate: 1.12,
    confirmationCode: '11500',
  })
  .addOffer({
    id: 'green-fpt-1',
    name: 'Fixed Green 1 Year',
    type: 'fpt',
    term: 1,
    rate: 1.22,
    confirmationCode: '11501',
  });
