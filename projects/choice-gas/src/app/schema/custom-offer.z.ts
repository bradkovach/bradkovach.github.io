import z from 'zod';

import { Market } from '../data/Market';
import { OfferBaseSchema } from './offer-base.z';

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
// export interface CustomOffer extends HasId, HasName {
// 	/**
// 	 * A constant to add to the monthly amount.
// 	 */
// 	addendMonth?: number;
// 	/**
// 	 * A constant to add to the market rate.
// 	 * @default 0
// 	 */
// 	addendRate?: number;
// 	/**
// 	 * A constant to add to the usage.
// 	 * @default 0
// 	 */
// 	addendTherm?: number;
// 	/**
// 	 * A coefficient to multiply the monthly amount by.
// 	 * @default 1 when addendMonth is set; otherwise 0
// 	 */
// 	coefMonth?: number;
// 	/**
// 	 * A coefficient to multiply the market rate by.
// 	 * @default 1 when addendIndex is set; otherwise 0
// 	 */
// 	coefRate?: number;
// 	/**
// 	 * A coefficient to multiply the usage by.
// 	 * @default 1 when addendTherm is set; otherwise 0
// 	 */
// 	coefTherm?: number;
// 	market?: Market;
// 	term: number;
// 	type: 'custom';
// }
export const CustomOffer = z
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

export type CustomOffer = z.infer<typeof CustomOffer>;
