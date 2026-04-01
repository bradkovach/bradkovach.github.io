import z from 'zod';

import { OfferBaseSchema } from './offer-base.z';
import { SimpleOffer } from './simple-offer.z';

// export interface BestOffer {
// 	offers: Omit<SimpleOffer, 'id'>[];
// 	type: 'best';
// }

export const BestOfferSchema = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(
		z.object({
			offers: z.array(SimpleOffer),
			type: z.literal('best'),
		}),
	);

export type BestOffer = z.infer<typeof BestOfferSchema>;
