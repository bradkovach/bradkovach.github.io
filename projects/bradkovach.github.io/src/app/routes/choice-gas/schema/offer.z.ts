import z from 'zod';

import { CompoundOfferSchema } from './compound-offer.z';
import { CustomOfferSchema } from './custom-offer.z';
import { FixedPerMonthOfferSchema } from './fixed-per-month.z';
import { FixedPerThermOfferSchema } from './fixed-per-therm-offer.z';
import { SimpleOffer } from './simple-offer.z';

export const AnyOffer = z.union([
	FixedPerThermOfferSchema,
	FixedPerMonthOfferSchema,
	SimpleOffer,
	CompoundOfferSchema,
	CustomOfferSchema,
]);
// export type Offer = (CompoundOffer | CustomOffer | SimpleOffer) & OfferBase;

export type AnyOffer = z.infer<typeof AnyOffer>;

export type OfferType = AnyOffer['type'];
