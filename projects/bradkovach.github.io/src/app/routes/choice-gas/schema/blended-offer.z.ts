import z from 'zod';

import { OfferBaseSchema } from './offer-base.z';
import { SimpleOffer } from './simple-offer.z';

export const BlendedOfferSchema = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(
		z.object({
			offers: z.array(z.tuple([z.number(), SimpleOffer])),
			type: z.literal('blended'),
		}),
	);

export type BlendedOffer = z.infer<typeof BlendedOfferSchema>;
