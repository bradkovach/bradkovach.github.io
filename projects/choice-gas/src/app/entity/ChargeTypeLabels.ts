import { ChargeType } from './ChargeType';

export const ChargeTypeLabels: Record<ChargeType, string> = {
	[ChargeType.PerMonth]: 'Per Month',
	[ChargeType.PerTherm]: 'Per Therm',
	[ChargeType.Tax]: 'Tax',
};
