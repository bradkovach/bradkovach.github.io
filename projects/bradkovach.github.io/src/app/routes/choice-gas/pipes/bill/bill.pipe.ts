import type { PipeTransform } from '@angular/core';

import type { Series } from '../../data/data.default';
import type { Month } from '../../data/enum/month.enum';
import type { Market } from '../../data/Market';
import type { Bill } from '../../entity/Bill';
import type { Charge } from '../../entity/Charge';
import type { FixedArray } from '../../entity/FixedArray';
import type { Line } from '../../entity/Line';
import type { Offer } from '../../entity/Offer';

import { Pipe } from '@angular/core';

import { marketLabels } from '../../data/data.current';
import { line } from '../../entity/Bill';
import { ChargeType } from '../../entity/ChargeType';
import { calculateCommodityCharge } from '../../entity/Offer';

export const createBill = (
	offer: Offer,
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
		bill.lines[ChargeType.PerMonth].push(
			line(`[Fixed Per-Month] Commodity Charge`, 1, offer.rate),
		);
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
						term: offer.term,
					} as Offer,
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
		return offer.offers
			.map((offer) => {
				return createBill(
					offer as Offer,
					month,
					usage,
					charges,
					marketRates,
				);
			})
			.sort((a, b) => a.total - b.total)[0];
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

@Pipe({
	name: 'bill',
	standalone: true,
})
export class BillPipe implements PipeTransform {
	transform(
		offer: Offer,
		month: Month,
		usage: FixedArray<number, 12>,
		charges: Charge[],
		marketRates: Record<Series, FixedArray<number, 12>>,
	): Bill {
		return createBill(offer, month, usage, charges, marketRates);
	}
}
