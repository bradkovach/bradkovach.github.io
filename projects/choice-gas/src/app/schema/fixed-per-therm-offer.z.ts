import z from 'zod';

import { OfferBaseSchema } from './offer-base.z';

export const FixedPerThermSansBase = z.object({
	rate: z.number(),
	type: z.literal('fpt'),
});

export type FixedPerThermSansBase = z.infer<typeof FixedPerThermSansBase>;

export const FixedPerThermOffer = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(FixedPerThermSansBase);

export type FixedPerThermOffer = z.infer<typeof FixedPerThermOffer>;
