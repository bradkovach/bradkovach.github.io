import { Market, currentCigRate, currentGcaRate } from './data.current';
import { Charge } from './entity/Charge';
import { ChargeType } from './entity/ChargeType';
import { FixedArray } from './entity/FixedArray';

export const defaultRates: Record<Market, FixedArray<number, 12>> = {
  [Market.CIG]: Array(12).fill(currentCigRate) as FixedArray<number, 12>,
  [Market.GCA]: Array(12).fill(currentGcaRate) as FixedArray<number, 12>,
};
export const defaultCharges: Charge[] = [
  {
    name: 'Volumetric Charge',
    rate: 0.2008,
    type: ChargeType.PerTherm,
  },
  {
    name: 'EE Surcharge',
    rate: 0.0046,
    type: ChargeType.PerTherm,
  },
  {
    name: 'Customer Charge',
    rate: 33,
    type: ChargeType.PerMonth,
  },

  { name: 'WY State Sales Tax', rate: 0.06, type: ChargeType.Tax },
  { name: 'Albany County Sales Tax', rate: 0.01, type: ChargeType.Tax },
]; // [144,118,77,107,56,30,15,6,31,64,78,116] // my fr usage

export const defaultUsage: FixedArray<number, 12> = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
