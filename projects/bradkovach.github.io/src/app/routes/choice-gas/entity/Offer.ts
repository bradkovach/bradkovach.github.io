// type Offer =
// 	| CustomOffer
// 	| FixedPerThermOffer
// 	| FixedPerMonthOffer
// 	| IndexOffer
// 	| BlendedOffer
// 	| BestOfOffer;

import type { FixedArray } from './FixedArray';
import type { Line } from './Line';

import z from 'zod';

import { marketLabels } from '../data/data.current';
import { Market } from '../data/Market';
import { line } from './Bill';
import { ChargeType } from './ChargeType';

export interface OfferBase extends HasId, HasName {
	confirmationCode?: null | string;
	isSpecial?: boolean | null;
	term: number;
	vendor_id?: string;
}

export const OfferBaseSchema = z.object({
	confirmationCode: z.string().nullable().optional(),
	id: z.string(),
	isSpecial: z.boolean().nullable().optional(),
	name: z.string(),
	term: z.number(),
	vendor_id: z.string().optional(),
});

// export interface Offer {
// 	vendor_id?: string;
// 	id: string;
// 	name: string;
// 	term: number;
// 	type: 'custom' | 'fpt' | 'fpm' | 'index' | 'blended' | 'bestOf' | 'gca';
// 	rate: number;
// }

export interface FixedPerThermOffer {
	rate: number;
	type: 'fpt';
}
export const FixedPerThermOfferSchema = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(z.object({ rate: z.number(), type: z.literal('fpt') }));

export interface FixedPerMonthOffer {
	rate: number;
	type: 'fpm';
}
export const FixedPerMonthOfferSchema = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(z.object({ rate: z.number(), type: z.literal('fpm') }));

export interface MarketOffer {
	market: Market;
	rate: number;
	type: 'market';
}
export const MarketOfferSchema = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(
		z.object({
			market: z.nativeEnum(Market),
			rate: z.number(),
			type: z.literal('market'),
		}),
	);

export type SimpleOffer = FixedPerMonthOffer | FixedPerThermOffer | MarketOffer;

export const SimpleOfferSchema = z.union([
	FixedPerThermOfferSchema,
	FixedPerMonthOfferSchema,
	MarketOfferSchema,
]);

export interface BlendedOffer {
	offers: [number, Omit<SimpleOffer, 'id' | 'term'>][];
	type: 'blended';
}

export const BlendedOfferSchema = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(
		z.object({
			offers: z.array(z.tuple([z.number(), z.any(SimpleOfferSchema)])),
			type: z.literal('blended'),
		}),
	);

export interface BestOffer {
	offers: Omit<SimpleOffer, 'id'>[];
	type: 'best';
}
export const BestOfferSchema = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(
		z.object({
			offers: z.array(SimpleOfferSchema),
			type: z.literal('best'),
		}),
	);

export type CompoundOffer = BestOffer | BlendedOffer;
export const CompoundOfferSchema = z.union([
	BlendedOfferSchema,
	BestOfferSchema,
]);

export type OfferType = Offer['type'];

export const OfferTypeSchema = z.enum([
	'fpt',
	'fpm',
	'market',
	'blended',
	'best',
	'custom',
]);

export interface HasId {
	id: string;
}

export interface HasName {
	name: string;
}

export const fptOfferToCustomOffer = (
	offer: FixedPerThermOffer & OfferBase,
): CustomOffer => ({
	coefTherm: offer.rate,
	id: offer.id,
	name: offer.name,
	term: offer.term,
	type: 'custom',
});

export const fpmOfferToCustomOffer = (
	offer: FixedPerMonthOffer & OfferBase,
): CustomOffer => ({
	addendMonth: offer.rate,
	id: offer.id,
	name: offer.name,
	term: offer.term,
	type: 'custom',
});

export const marketOfferToCustomOffer = (
	offer: MarketOffer & OfferBase,
): CustomOffer => ({
	addendRate: offer.rate,
	coefRate: 1,
	id: offer.id,
	market: offer.market,
	name: offer.name,
	term: offer.term,
	type: 'custom',
});

/**
 * price = 0
 * 	+ (usage * (coefIndex * index + addendIndex))
 * 	+ (usage * (coefTherm * therms + addendTherm))
 * 	+ (usage * (coefGCA * GCA + addendGCA))
 * 	+ (coefMonth * month + addendMonth)
 *
 * @example A "Less Than GCA rate"
 * 	{
 * 			"type": "custom",
 * 			"name": "Guaranteed Less Than GCA rate",
 * 			"addendGCA": -0.01,
 * 	}
 *
 * @example A "Fixed Rate Per Therm"
 * 	{
 * 			"type": "custom",
 * 			"name": "Fixed Rate Per Therm",
 * 			"coefTherm": 0.2008,
 * 	}
 *
 * @example A "Fixed Rate Per Month"
 * 	{
 * 			"type": "custom",
 * 			"name": "Fixed Rate Per Month",
 * 			"addendMonth": 33,
 * 	}
 *
 */
export interface CustomOffer extends HasId, HasName {
	/**
	 * A constant to add to the monthly amount.
	 */
	addendMonth?: number;
	/**
	 * A constant to add to the market rate.
	 * @default 0
	 */
	addendRate?: number;

	/**
	 * A constant to add to the usage.
	 * @default 0
	 */
	addendTherm?: number;

	/**
	 * A coefficient to multiply the monthly amount by.
	 * @default 1 when addendMonth is set; otherwise 0
	 */
	coefMonth?: number;

	/**
	 * A coefficient to multiply the market rate by.
	 * @default 1 when addendIndex is set; otherwise 0
	 */
	coefRate?: number;

	/**
	 * A coefficient to multiply the usage by.
	 * @default 1 when addendTherm is set; otherwise 0
	 */
	coefTherm?: number;

	market?: Market;

	term: number;

	type: 'custom';
}

export const CustomOfferSchema = z
	.object({})
	.merge(OfferBaseSchema)
	.merge(
		z.object({
			addendMonth: z.number().optional(),
			addendRate: z.number().optional(),
			addendTherm: z.number().optional(),
			coefMonth: z.number().optional(),
			coefRate: z.number().optional(),
			coefTherm: z.number().optional(),
			market: z.nativeEnum(Market).optional(),
			term: z.number(),
			type: z.literal('custom'),
		}),
	);

export type Offer = (CompoundOffer | CustomOffer | SimpleOffer) & OfferBase;

export const OfferSchema = z.union([
	FixedPerThermOfferSchema,
	FixedPerMonthOfferSchema,
	SimpleOfferSchema,
	CompoundOfferSchema,
	CustomOfferSchema,
]);

export const calculateCommodityCharge =
	(
		offer: CustomOffer,
		therms: number,
		rates: Record<Market, FixedArray<number, 12>>,
	) =>
	(month: number): Record<ChargeType, Line[]> => {
		const market = offer.market ?? Market.CIG;
		const rate = rates[market][month];

		const addendRate = offer.addendRate ?? 0;
		const coefRate = offer.coefRate ?? 1;

		const addendTherm = offer.addendTherm ?? 0;
		const coefTherm = offer.coefTherm ?? 1;

		const addendMonth = offer.addendMonth ?? 0;
		const coefMonth = offer.coefMonth ?? 1;

		const useTherms = coefTherm * therms + addendTherm;
		const useRate = coefRate * rate + addendRate;
		const useMonth = coefMonth * 1 + addendMonth;

		return {
			[ChargeType.PerMonth]: [
				line(`[custom $/month] ${offer.name}`, 1, useMonth),
			],
			[ChargeType.PerTherm]: [
				line(`[info] ${marketLabels[market]} Rate`, 0, rate),
				line(`[custom $/therm] ${offer.name}`, useTherms, useRate),
			],
			[ChargeType.Tax]: [],
		};
	};
