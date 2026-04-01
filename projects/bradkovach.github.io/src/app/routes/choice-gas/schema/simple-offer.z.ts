import z from 'zod';

import { FixedPerMonthOfferSchema } from './fixed-per-month.z';
import { FixedPerThermOfferSchema } from './fixed-per-therm-offer.z';
import { MarketOffer } from './market-offer.z';

export const SimpleOffer = z.union([
	FixedPerThermOfferSchema,
	FixedPerMonthOfferSchema,
	MarketOffer,
]);

export type SimpleOffer = z.infer<typeof SimpleOffer>;
