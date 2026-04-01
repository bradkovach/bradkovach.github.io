import z from 'zod';

import { OfferBaseSchema } from './offer-base.z';

// export interface FixedPerMonthOffer {
// 	rate: number;
// 	type: 'fpm';
// }

export const FixedPerMonthOfferSchema = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(z.object({ rate: z.number(), type: z.literal('fpm') }));

export type FixedPerMonthOffer = z.infer<typeof FixedPerMonthOfferSchema>;
