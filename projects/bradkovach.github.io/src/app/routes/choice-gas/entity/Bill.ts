import type { Line } from './Line';
import type { ChargeType } from './ChargeType';
import type { Month } from '../data/enum/month.enum';

export const line = (
	description: string,
	quantity: number,
	rate: number,
): Line => [description, quantity, rate, quantity * rate];

export interface Bill {
	dollarsPerTherm: number;
	lines: Record<ChargeType, Line[]>;
	month: Month;
	subtotals: Record<ChargeType, number>;
	therms: number;
	thermsPerDollar: number;
	total: number;
}
