import { Month } from '../data/enum/month.enum';
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
	lines: Record<ChargeType, Line[]>;
	subtotals: Record<ChargeType, number>;
	dollarsPerTherm: number;
	thermsPerDollar: number;
	total: number;
}
