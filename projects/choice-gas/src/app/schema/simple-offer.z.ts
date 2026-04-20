import z from 'zod';

import { FixedPerMonthOffer, FixedPerMonthSansBase } from './fixed-per-month.z';
import {
	FixedPerThermOffer,
	FixedPerThermSansBase,
} from './fixed-per-therm-offer.z';
import { MarketOffer, MarketOfferSansBase } from './market-offer.z';

export const SimpleOfferSansBase = z.discriminatedUnion('type', [
	FixedPerThermSansBase,
	FixedPerMonthSansBase,
	MarketOfferSansBase,
]);

export const SimpleOffer = z.discriminatedUnion('type', [
	FixedPerThermOffer,
	FixedPerMonthOffer,
	MarketOffer,
]);

export type SimpleOffer = z.infer<typeof SimpleOffer>;
