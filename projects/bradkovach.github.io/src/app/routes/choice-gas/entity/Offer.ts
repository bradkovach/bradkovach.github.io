// type Offer =
// 	| CustomOffer
// 	| FixedPerThermOffer
// 	| FixedPerMonthOffer
// 	| IndexOffer
// 	| BlendedOffer
// 	| BestOfOffer;

import { Market } from '../choice-gas-calculator/Market';

export interface OfferBase extends HasId, HasName {
	vendor_id?: string;
	term: number;
}

// export interface Offer {
// 	vendor_id?: string;
// 	id: string;
// 	name: string;
// 	term: number;
// 	type: 'custom' | 'fpt' | 'fpm' | 'index' | 'blended' | 'bestOf' | 'gca';
// 	rate: number;
// }

export type FixedPerThermOffer = { type: 'fpt'; rate: number };
export type FixedPerMonthOffer = { type: 'fpm'; rate: number };
export type MarketOffer<M extends Market> = {
	type: 'market';
	market: M;
	rate: number;
};
export type IndexOffer = MarketOffer<Market.CIG>;
export type GcaOffer = MarketOffer<Market.GCA>;
export type BlendedOffer = { type: 'blended'; offers: [number, Offer][] };
export type BestOffer = { type: 'best'; offers: Offer[] };

export type Offer = OfferBase &
	(
		| FixedPerThermOffer
		| FixedPerMonthOffer
		| IndexOffer
		| GcaOffer
		| MarketOffer<Market>
		| BlendedOffer
		| BestOffer
	);

export type OfferType = Offer['type'];

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

export const indexOfferToCustomOffer = (
	offer: IndexOffer & OfferBase,
): CustomOffer => ({
	type: 'custom',
	id: offer.id,
	name: offer.name,
	term: offer.term,
	coefIndex: 1,
	addendIndex: offer.rate,
});

export const gcaOfferToCustomOffer = (
	offer: GcaOffer & OfferBase,
): CustomOffer => ({
	type: 'custom',
	id: offer.id,
	name: offer.name,
	term: offer.term,
	coefGCA: 1,
	addendGCA: offer.rate,
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

	/**
	 * A coefficient to multiply the market rate by.
	 * @default 1 when addendIndex is set; otherwise 0
	 */
	coefIndex?: number;

	/**
	 * A constant to add to the market rate.
	 * @default 0
	 */
	addendIndex?: number;

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
	 * A coefficient to multiply the GCA rate by.
	 * @default 1 when addendGCA is set; otherwise 0
	 */
	coefGCA?: number;

	/**
	 * A constant to add to the GCA rate.
	 * @default 0
	 */
	addendGCA?: number;

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

export const calculateCommodityCharge = (
	offer: CustomOffer,
	therms: number,
	cig: number,
	gca: number,
): number => {
	const addendIndex = offer.addendIndex ?? 0;
	const coefIndex = offer.coefIndex ?? (addendIndex ? 1 : 0);

	const addendTherm = offer.addendTherm ?? 0;
	const coefTherm = offer.coefTherm ?? (addendTherm ? 1 : 0);

	const addendGCA = offer.addendGCA ?? 0;
	const coefGCA = offer.coefGCA ?? (addendGCA ? 1 : 0);

	const addendMonth = offer.addendMonth ?? 0;
	const coefMonth = offer.coefMonth ?? (addendMonth ? 1 : 0);

	// prettier-ignore
	return (
		0 +
		coefMonth *
			(
				therms * (coefIndex * cig + addendIndex) +
				therms * (coefGCA * gca + addendGCA) +
				(coefTherm * therms + addendTherm)
			) +
		addendMonth
	);
};
