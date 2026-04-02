import z from 'zod';

import { OfferBaseSchema } from './offer-base.z';
import { SimpleOfferSansBase } from './simple-offer.z';

export const BlendedOfferSansBase = z.object({
	offers: z.array(z.tuple([z.number(), SimpleOfferSansBase])),
	type: z.literal('blended'),
});

export type BlendedOfferSansBase = z.infer<typeof BlendedOfferSansBase>;

export const BlendedOffer = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(BlendedOfferSansBase);

export type BlendedOffer = z.infer<typeof BlendedOffer>;
