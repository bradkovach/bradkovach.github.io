import z from 'zod';

import { OfferBaseSchema } from './offer-base.z';

export const FixedPerMonthSansBase = z.object({
	rate: z.number().optional().nullable(),
	type: z.literal('fpm'),
});

export type FixedPerMonthSansBase = z.infer<typeof FixedPerMonthSansBase>;

export const FixedPerMonthOffer = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(FixedPerMonthSansBase);

export type FixedPerMonthOffer = z.infer<typeof FixedPerMonthOffer>;
