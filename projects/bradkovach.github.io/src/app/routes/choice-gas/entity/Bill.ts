import { Month } from '../choice-gas-calculator/choice-gas-calculator.component';
import { ChargeType } from './ChargeType';

export type Line = [string, number, number, number];

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
