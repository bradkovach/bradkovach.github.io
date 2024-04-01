import { Pipe, PipeTransform } from '@angular/core';
import { Market } from './choice-gas-calculator/Market';
import {
	Month,
	monthLabels,
} from './choice-gas-calculator/choice-gas-calculator.component';
import { Bill, line } from './entity/Bill';
import { Charge } from './entity/Charge';
import { ChargeType } from './entity/ChargeType';
import { FixedArray } from './entity/FixedArray';
import { Offer } from './entity/Offer';

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
		marketRates: Record<Market, number>,
		marketLabels: Record<Market, string>,
	): Bill {
		console.count(
			`${offer.name}; ${offer.term} year; ${monthLabels[month]}`,
		);
		const bill: Bill = {
			month: Month.January,
			therms: usage[month],
			total: 0,
			lines: {
				[ChargeType.PerTherm]: [],
				[ChargeType.PerMonth]: [],
				[ChargeType.Tax]: [],
			},
			subtotals: {
				[ChargeType.PerTherm]: 0,
				[ChargeType.PerMonth]: 0,
				[ChargeType.Tax]: 0,
			},
		};
		// deal with charges

		if (offer.type === 'fpt') {
			bill.lines[ChargeType.PerTherm].push(
				line(`[Per-Therm] Commodity Charge`, bill.therms, offer.rate),
			);
		} else if (offer.type === 'fpm') {
			bill.lines[ChargeType.PerMonth].push(
				line(`[Per-Month] Commodity Charge`, 1, offer.rate),
			);
		} else if (offer.type === 'market') {
			const market = offer.market;
			const marketRate = marketRates[market];
			const marketLabel = marketLabels[market];
			const calculatedRate = offer.rate + marketRates[market];
			bill.lines[ChargeType.PerTherm].push(
				line(
					`[${marketLabel} @ ${marketRate}] Commodity Charge`,
					bill.therms,
					calculatedRate,
				),
			);
		} else if (offer.type === 'blended') {
			const sumOfWeights = offer.offers.reduce(
				(acc, [weight, _]) => acc + weight,
				0,
			);
		} else if (offer.type === 'best') {
			return offer.offers
				.map((offer) => {
					return this.transform(
						offer,
						month,
						usage,
						charges,
						marketRates,
						marketLabels,
					);
				})
				.sort((a, b) => a.total - b.total)[0];
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
		].reduce((acc, [_, qty, rate, value]) => acc + value, 0);
		bill.subtotals[ChargeType.PerMonth] = bill.lines[
			ChargeType.PerMonth
		].reduce((acc, [_, qty, rate, value]) => acc + value, 0);

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
			(acc, [_, qty, rate, value]) => acc + value,
			0,
		);

		bill.total =
			bill.subtotals[ChargeType.PerTherm] +
			bill.subtotals[ChargeType.PerMonth] +
			bill.subtotals[ChargeType.Tax];

		return bill;
	}
}
