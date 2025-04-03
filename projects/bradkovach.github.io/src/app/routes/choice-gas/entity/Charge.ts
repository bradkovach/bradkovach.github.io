import type { ChargeType } from './ChargeType';

export interface Charge {
	name: string;
	rate: number;
	type: ChargeType;
}
