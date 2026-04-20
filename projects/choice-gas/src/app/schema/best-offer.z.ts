import z from 'zod';

import { OfferBaseSchema } from './offer-base.z';
import { SimpleOfferSansBase } from './simple-offer.z';

export const BestOfferSansBase = z.object({
	offers: z.array(SimpleOfferSansBase),
	type: z.literal('best'),
});

export type BestOfferSansBase = z.infer<typeof BestOfferSansBase>;

export const BestOffer = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(BestOfferSansBase);

export type BestOffer = z.infer<typeof BestOffer>;
