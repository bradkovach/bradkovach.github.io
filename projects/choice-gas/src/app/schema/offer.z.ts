import z from 'zod';

import { CompoundOffer } from './compound-offer.z';
import { CustomOffer } from './custom-offer.z';
import { FixedPerMonthOffer } from './fixed-per-month.z';
import { FixedPerThermOffer } from './fixed-per-therm-offer.z';
import { SimpleOffer } from './simple-offer.z';

export const AnyOffer = z.union([
	FixedPerThermOffer,
	FixedPerMonthOffer,
	SimpleOffer,
	CompoundOffer,
	CustomOffer,
]);

export type AnyOffer = z.infer<typeof AnyOffer>;

export type OfferType = AnyOffer['type'];
