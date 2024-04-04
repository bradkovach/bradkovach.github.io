import { Market } from '../../data.current';
import { Vendor } from '../../entity/Vendor';

export const blackHillsWyomingGas = new Vendor(
  'com.choicegas',
  'Black Hills Wyoming Gas, LLC',
  'https://choicegas.com',
  '8772453506',
).addOffer({
  name: 'Gas Cost Adjustment (GCA) Regulated Rate',
  term: 1,
  type: 'market',
  market: Market.GCA,
  id: 'gca',
  rate: 0,
  confirmationCode: '99001',
});
