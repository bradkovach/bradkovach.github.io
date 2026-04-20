import z from 'zod';

import { BestOffer } from './best-offer.z';
import { BlendedOffer } from './blended-offer.z';

export const CompoundOffer = z.discriminatedUnion('type', [
	BlendedOffer,
	BestOffer,
]);

export type CompoundOffer = z.infer<typeof CompoundOffer>;
