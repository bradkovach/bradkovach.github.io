import { ChargeType } from './ChargeType';

export const ChargeTypeLabels: Record<ChargeType, string> = {
	[ChargeType.PerTherm]: 'Per Therm',
	[ChargeType.PerMonth]: 'Per Month',
	[ChargeType.Tax]: 'Tax',
};
