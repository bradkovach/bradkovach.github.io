import z from 'zod';

import { BestOfferSchema } from './best-offer.z';
import { BlendedOfferSchema } from './blended-offer.z';

export const CompoundOfferSchema = z.union([
	BlendedOfferSchema,
	BestOfferSchema,
]);

export type CompoundOffer = z.infer<typeof CompoundOfferSchema>;
