import z from 'zod';

import { OfferBaseSchema } from './offer-base.z';

// export interface Offer {
// 	vendor_id?: string;
// 	id: string;
// 	name: string;
// 	term: number;
// 	type: 'custom' | 'fpt' | 'fpm' | 'index' | 'blended' | 'bestOf' | 'gca';
// 	rate: number;
// }
// export interface FixedPerThermOffer {
// 	rate: number;
// 	type: 'fpt';
// }

export const FixedPerThermOfferSchema = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(z.object({ rate: z.number(), type: z.literal('fpt') }));

export type FixedPerThermOffer = z.infer<typeof FixedPerThermOfferSchema>;
