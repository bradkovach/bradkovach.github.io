import z from 'zod';

import { BestOffer, BestOfferSansBase } from './best-offer.z';
import { BlendedOffer, BlendedOfferSansBase } from './blended-offer.z';
import { CustomOffer, CustomOfferSansBase } from './custom-offer.z';
import { FixedPerMonthOffer, FixedPerMonthSansBase } from './fixed-per-month.z';
import {
	FixedPerThermOffer,
	FixedPerThermSansBase,
} from './fixed-per-therm-offer.z';
import { MarketOffer, MarketOfferSansBase } from './market-offer.z';

export const AnyOfferSansBase = z.discriminatedUnion('type', [
	MarketOfferSansBase,
	FixedPerMonthSansBase,
	FixedPerThermSansBase,
	BlendedOfferSansBase,
	BestOfferSansBase,
	CustomOfferSansBase,
]);

export type AnyOfferSansBase = z.infer<typeof AnyOfferSansBase>;

export const AnyOffer = z.discriminatedUnion('type', [
	MarketOffer,
	FixedPerMonthOffer,
	FixedPerThermOffer,
	BlendedOffer,
	BestOffer,
	CustomOffer,
]);

export type AnyOffer = z.infer<typeof AnyOffer>;

export type OfferType = AnyOffer['type'];
