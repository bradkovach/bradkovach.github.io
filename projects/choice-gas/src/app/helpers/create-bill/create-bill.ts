import type { Month } from '../../data/enum/month.enum';
import type { Market } from '../../data/Market';
import type { Charge } from '../../entity/Charge';
import type { FixedArray } from '../../entity/FixedArray';
import type { Line } from '../../entity/Line';
import type { FixedPerMonthSansBase } from '../../schema/fixed-per-month.z';
import type { FixedPerThermSansBase } from '../../schema/fixed-per-therm-offer.z';
import type { MarketOfferSansBase } from '../../schema/market-offer.z';
import type { AnyOffer } from '../../schema/offer.z';

import { marketLabels } from '../../data/data.current';
import { type Bill, line } from '../../entity/Bill';
import { ChargeType } from '../../entity/ChargeType';
import { calculateCommodityCharge } from '../calculate-commodity-charge';

export const firstOrThrow = <T>(
	arr: T[],
	errorMessage = 'Array is empty',
): T => {
	if (arr.length === 0) {
		throw new Error(errorMessage);
	}
	return arr[0];
};

export const createBill = (
	offer:
		| AnyOffer
		| FixedPerMonthSansBase
		| FixedPerThermSansBase
		| MarketOfferSansBase,
	month: Month,
	usage: FixedArray<number, 12>,
	charges: Charge[],
	marketRates: Record<Market, FixedArray<number, 12>>,
): Bill => {
	const bill: Bill = {
		dollarsPerTherm: 0,
		lines: {
			[ChargeType.PerMonth]: [],
			[ChargeType.PerTherm]: [],
			[ChargeType.Tax]: [],
		},
		month: month,
		subtotals: {
			[ChargeType.PerMonth]: 0,
			[ChargeType.PerTherm]: 0,
			[ChargeType.Tax]: 0,
		},
		therms: usage[month],
		thermsPerDollar: 0,
		total: 0,
	};
	// deal with charges
	if (offer.type === 'fpt') {
		bill.lines[ChargeType.PerTherm].push(
			line(`[Fixed Per-Therm] Commodity Charge`, bill.therms, offer.rate),
		);
	} else if (offer.type === 'fpm') {
		if (offer.rate) {
			bill.lines[ChargeType.PerMonth].push(
				line(`[Fixed Per-Month] Commodity Charge`, 1, offer.rate),
			);
		} else {
			bill.lines[ChargeType.PerMonth].push(
				line(
					`[Fixed Per-Month] Edit rate to see commodity charge calculation`,
					1,
					0,
				),
			);
		}
	} else if (offer.type === 'market') {
		const market = offer.market;
		const marketRate = marketRates[market][month];
		const marketLabel = marketLabels[market];
		const calculatedRate = offer.rate + marketRates[market][month];
		bill.lines[ChargeType.PerTherm].push(
			line(
				`[${marketLabel} @ ${marketRate} + ${offer.rate}] Commodity Charge`,
				bill.therms,
				calculatedRate,
			),
		);
	} else if (offer.type === 'blended') {
		const sumOfWeights = offer.offers.reduce(
			(acc, [weight]) => acc + weight,
			0,
		);
		offer.offers
			.map(([weight, suboffer]) => {
				const subbill = createBill(
					{
						...suboffer,
						id: '',
						name: offer.name,
						term: offer.term,
					},
					month,
					usage,
					[], // no charges for subbill
					marketRates,
				);

				return {
					[ChargeType.PerMonth]: subbill.lines[
						ChargeType.PerMonth
					].map(([name, qty, rate]) =>
						line(
							`[blended @ ${weight / sumOfWeights}] ${name}`,
							(qty * weight) / sumOfWeights,
							rate,
						),
					),
					[ChargeType.PerTherm]: subbill.lines[
						ChargeType.PerTherm
					].map(([name, qty, rate]) =>
						line(
							`[blended @ ${weight / sumOfWeights}] ${name}`,
							(qty * weight) / sumOfWeights,
							rate,
						),
					),
				} as Record<ChargeType, Line[]>;
			})
			.forEach((result) => {
				bill.lines[ChargeType.PerTherm].push(
					...result[ChargeType.PerTherm],
				);
				bill.lines[ChargeType.PerMonth].push(
					...result[ChargeType.PerMonth],
				);
			});
	} else if (offer.type === 'best') {
		const best = firstOrThrow(
			offer.offers
				.map((offer) => {
					const bill = createBill(
						offer,
						month,
						usage,
						charges,
						marketRates,
					);
					return { bill, offer };
				})
				.sort((a, b) => a.bill.total - b.bill.total),
		);
		if (best.offer.type === 'fpt') {
			// add a line explaining why this offer was the best
			best.bill.lines[ChargeType.PerTherm].push(
				line(
					`[Best Offer] Fixed Per Therm @ ${best.offer.rate} per therm`,
					0,
					0,
				),
			);
		} else if (best.offer.type === 'fpm') {
			best.bill.lines[ChargeType.PerMonth].push(
				line(
					`[Best Offer] Fixed Per Month @ ${best.offer.rate} per month`,
					0,
					0,
				),
			);
		} else if (best.offer.type === 'market') {
			const market = best.offer.market;
			const marketRate = marketRates[market][month];
			const marketLabel = marketLabels[market];
			best.bill.lines[ChargeType.PerTherm].push(
				line(
					`[Best Offer] Market / ${marketLabel} @ ${marketRate} + ${best.offer.rate}`,
					0,
					0,
				),
			);
		}
		return best.bill;
	} else if (offer.type === 'custom') {
		const customLines = calculateCommodityCharge(
			offer,
			usage[month],
			marketRates,
		)(month);
		bill.lines[ChargeType.PerTherm].push(
			...customLines[ChargeType.PerTherm],
		);
		bill.lines[ChargeType.PerMonth].push(
			...customLines[ChargeType.PerMonth],
		);
	}

	// do the type != tax
	charges
		.filter((charge) => charge.type !== ChargeType.Tax)
		.forEach((charge) => {
			if (charge.type === ChargeType.PerTherm) {
				bill.lines[ChargeType.PerTherm].push(
					line(`${charge.name}`, bill.therms, charge.rate),
				);
			} else if (charge.type === ChargeType.PerMonth) {
				bill.lines[ChargeType.PerMonth].push(
					line(charge.name, 1, charge.rate),
				);
			}
		});

	// subtotal
	bill.subtotals[ChargeType.PerTherm] = bill.lines[
		ChargeType.PerTherm
	].reduce((acc, [, , , value]) => acc + value, 0);
	bill.subtotals[ChargeType.PerMonth] = bill.lines[
		ChargeType.PerMonth
	].reduce((acc, [, , , value]) => acc + value, 0);

	bill.lines[ChargeType.Tax] = charges
		.filter((charge) => charge.type === ChargeType.Tax)
		.map((charge) => {
			const taxable =
				bill.subtotals[ChargeType.PerTherm] +
				bill.subtotals[ChargeType.PerMonth];

			return line(
				`${charge.name} $${taxable.toFixed(2)} @ ${(
					charge.rate * 100
				).toFixed(0)}%`,
				taxable,
				charge.rate,
			);
		});

	bill.subtotals[ChargeType.Tax] = bill.lines[ChargeType.Tax].reduce(
		(acc, [, , , value]) => acc + value,
		0,
	);

	bill.total =
		bill.subtotals[ChargeType.PerTherm] +
		bill.subtotals[ChargeType.PerMonth] +
		bill.subtotals[ChargeType.Tax];

	bill.dollarsPerTherm = bill.total / bill.therms;
	bill.thermsPerDollar = bill.therms / bill.total;

	return bill;
};
