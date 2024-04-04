// type Offer =
// 	| CustomOffer
// 	| FixedPerThermOffer
// 	| FixedPerMonthOffer
// 	| IndexOffer
// 	| BlendedOffer
// 	| BestOfOffer;

import { Market } from '../data.current';

import z from 'zod';
import { marketLabels } from '../data.current';
import { line } from './Bill';
import { ChargeType } from './ChargeType';
import { FixedArray } from './FixedArray';
import { Line } from './Line';

export interface OfferBase extends HasId, HasName {
  vendor_id?: string;
  term: number;
  confirmationCode?: string | null;
  isSpecial?: boolean | null;
}

export const OfferBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  term: z.number(),
  vendor_id: z.string().optional(),
  confirmationCode: z.string().nullable().optional(),
  isSpecial: z.boolean().nullable().optional(),
});

// export interface Offer {
// 	vendor_id?: string;
// 	id: string;
// 	name: string;
// 	term: number;
// 	type: 'custom' | 'fpt' | 'fpm' | 'index' | 'blended' | 'bestOf' | 'gca';
// 	rate: number;
// }

export type FixedPerThermOffer = { type: 'fpt'; rate: number };
export const FixedPerThermOfferSchema = z
  .object({})
  .merge(OfferBaseSchema)
  .merge(z.object({ type: z.literal('fpt'), rate: z.number() }));

export type FixedPerMonthOffer = { type: 'fpm'; rate: number };
export const FixedPerMonthOfferSchema = z
  .object({})
  .merge(OfferBaseSchema)
  .merge(z.object({ type: z.literal('fpm'), rate: z.number() }));

export type MarketOffer = {
  type: 'market';
  market: Market;
  rate: number;
};
export const MarketOfferSchema = z
  .object({})
  .merge(OfferBaseSchema)
  .merge(
    z.object({
      type: z.literal('market'),
      market: z.nativeEnum(Market),
      rate: z.number(),
    }),
  );

export type SimpleOffer = FixedPerThermOffer | FixedPerMonthOffer | MarketOffer;

export const SimpleOfferSchema = z.union([
  FixedPerThermOfferSchema,
  FixedPerMonthOfferSchema,
  MarketOfferSchema,
]);

export type BlendedOffer = {
  type: 'blended';
  offers: [number, Omit<SimpleOffer, 'id' | 'term'>][];
};

export const BlendedOfferSchema = z
  .object({})
  .merge(OfferBaseSchema)
  .merge(
    z.object({
      type: z.literal('blended'),
      offers: z.array(z.tuple([z.number(), z.any(SimpleOfferSchema)])),
    }),
  );

export type BestOffer = { type: 'best'; offers: Omit<SimpleOffer, 'id'>[] };
export const BestOfferSchema = z
  .object({})
  .merge(OfferBaseSchema)
  .merge(
    z.object({
      type: z.literal('best'),
      offers: z.array(SimpleOfferSchema),
    }),
  );

export type CompoundOffer = BlendedOffer | BestOffer;
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
  type: 'custom',
  id: offer.id,
  name: offer.name,
  term: offer.term,
  coefTherm: offer.rate,
});

export const fpmOfferToCustomOffer = (
  offer: FixedPerMonthOffer & OfferBase,
): CustomOffer => ({
  type: 'custom',
  id: offer.id,
  name: offer.name,
  term: offer.term,
  addendMonth: offer.rate,
});

export const marketOfferToCustomOffer = (
  offer: MarketOffer & OfferBase,
): CustomOffer => ({
  type: 'custom',
  id: offer.id,
  market: offer.market,
  name: offer.name,
  term: offer.term,
  coefRate: 1,
  addendRate: offer.rate,
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
  type: 'custom';
  term: number;

  market?: Market;

  /**
   * A coefficient to multiply the market rate by.
   * @default 1 when addendIndex is set; otherwise 0
   */
  coefRate?: number;

  /**
   * A constant to add to the market rate.
   * @default 0
   */
  addendRate?: number;

  /**
   * A coefficient to multiply the usage by.
   * @default 1 when addendTherm is set; otherwise 0
   */
  coefTherm?: number;

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
   * A constant to add to the monthly amount.
   */
  addendMonth?: number;
}

export const CustomOfferSchema = z
  .object({})
  .merge(OfferBaseSchema)
  .merge(
    z.object({
      type: z.literal('custom'),
      term: z.number(),
      market: z.nativeEnum(Market).optional(),
      coefRate: z.number().optional(),
      addendRate: z.number().optional(),
      coefTherm: z.number().optional(),
      addendTherm: z.number().optional(),
      coefMonth: z.number().optional(),
      addendMonth: z.number().optional(),
    }),
  );

export type Offer = OfferBase & (SimpleOffer | CompoundOffer | CustomOffer);

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

    // prettier-ignore
    return {
    [ChargeType.PerTherm]: [
      line(`[info] ${marketLabels[market]} Rate`, 0, rate),
      line(`[custom $/therm] ${offer.name}`, useTherms, useRate),
    ],
    [ChargeType.PerMonth]: [
      line(`[custom $/month] ${offer.name}`, 1, useMonth),
    ],
    [ChargeType.Tax]:[]
  }
  };
