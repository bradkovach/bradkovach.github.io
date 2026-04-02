import type { FixedArray } from '../entity/FixedArray';
import type { Line } from '../entity/Line';
import type { CustomOffer } from '../schema/custom-offer.z';

import { marketLabels } from '../data/data.current';
import { Market } from '../data/Market';
import { line } from '../entity/Bill';
import { ChargeType } from '../entity/ChargeType';

export const calculateCommodityCharge =
	(
		offer: CustomOffer,
		therms: number,
		rates: Record<Market, FixedArray<number, 12>>,
	) =>
	(month: number): Record<ChargeType, Line[]> => {
		const market = offer.market ?? Market.CIG;
		const rate = rates[market][month];

		const addendRate = offer.addendRate ?? 0;
		const coefRate = offer.coefRate ?? 1;

		const addendTherm = offer.addendTherm ?? 0;
		const coefTherm = offer.coefTherm ?? 1;

		const addendMonth = offer.addendMonth ?? 0;
		const coefMonth = offer.coefMonth ?? 1;

		const useTherms = coefTherm * therms + addendTherm;
		const useRate = coefRate * rate + addendRate;
		const useMonth = coefMonth * 1 + addendMonth;

		return {
			[ChargeType.PerMonth]: [
				line(`[custom $/month] ${offer.name}`, 1, useMonth),
			],
			[ChargeType.PerTherm]: [
				line(`[info] ${marketLabels[market]} Rate`, 0, rate),
				line(`[custom $/therm] ${offer.name}`, useTherms, useRate),
			],
			[ChargeType.Tax]: [],
		};
	};
