import z from 'zod';

import { Market } from '../data/Market';
import { OfferBaseSchema } from './offer-base.z';

// export interface MarketOffer {
// 	market: Market;
// 	rate: number;
// 	type: 'market';
// }

export const MarketOfferSansBase = z.object({
	market: z.nativeEnum(Market),
	rate: z.number(),
	type: z.literal('market'),
});

export type MarketOfferSansBase = z.infer<typeof MarketOfferSansBase>;

export const MarketOffer = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(MarketOfferSansBase);

export type MarketOffer = z.infer<typeof MarketOffer>;
