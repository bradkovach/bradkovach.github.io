import { Month } from '../pages/explorer/explorer.component';
import { ChargeType } from './ChargeType';
import { Line } from './Line';

export const line = (
  description: string,
  quantity: number,
  rate: number,
): Line => [description, quantity, rate, quantity * rate];

export interface Bill {
  month: Month;
  therms: number;
  // perTherm: Line[];
  // perMonth: Line[];
  // taxes: Line[];
  lines: Record<ChargeType, Line[]>;
  subtotals: Record<ChargeType, number>;
  total: number;
}
