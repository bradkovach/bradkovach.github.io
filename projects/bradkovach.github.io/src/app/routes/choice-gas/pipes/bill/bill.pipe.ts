import { Pipe, PipeTransform } from '@angular/core';
import { Market, marketLabels } from '../../data.current';
import { Bill, line } from '../../entity/Bill';
import { Charge } from '../../entity/Charge';
import { ChargeType } from '../../entity/ChargeType';
import { FixedArray } from '../../entity/FixedArray';
import { Line } from '../../entity/Line';
import { Offer, calculateCommodityCharge } from '../../entity/Offer';
import { Month } from '../../pages/explorer/explorer.component';

export const createBill = (
  offer: Offer,
  month: Month,
  usage: FixedArray<number, 12>,
  charges: Charge[],
  marketRates: Record<Market, FixedArray<number, 12>>,
): Bill => {
  const bill: Bill = {
    month: month,
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
      (acc, [weight, _]) => acc + weight,
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
          [ChargeType.PerTherm]: subbill.lines[ChargeType.PerTherm].map(
            ([name, qty, rate, value]) =>
              line(
                `[blended @ ${weight / sumOfWeights}] ${name}`,
                (qty * weight) / sumOfWeights,
                rate,
              ),
          ),
          [ChargeType.PerMonth]: subbill.lines[ChargeType.PerMonth].map(
            ([name, qty, rate, value]) =>
              line(
                `[blended @ ${weight / sumOfWeights}] ${name}`,
                (qty * weight) / sumOfWeights,
                rate,
              ),
          ),
        } as Record<ChargeType, Line[]>;
      })
      .forEach((result) => {
        bill.lines[ChargeType.PerTherm].push(...result[ChargeType.PerTherm]);
        bill.lines[ChargeType.PerMonth].push(...result[ChargeType.PerMonth]);
      });
  } else if (offer.type === 'best') {
    return offer.offers
      .map((offer) => {
        return createBill(offer as Offer, month, usage, charges, marketRates);
      })
      .sort((a, b) => a.total - b.total)[0];
  } else if (offer.type === 'custom') {
    const customLines = calculateCommodityCharge(
      offer,
      usage[month],
      marketRates,
    )(month);
    bill.lines[ChargeType.PerTherm].push(...customLines[ChargeType.PerTherm]);
    bill.lines[ChargeType.PerMonth].push(...customLines[ChargeType.PerMonth]);
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
        bill.lines[ChargeType.PerMonth].push(line(charge.name, 1, charge.rate));
      }
    });

  // subtotal
  bill.subtotals[ChargeType.PerTherm] = bill.lines[ChargeType.PerTherm].reduce(
    (acc, [_, qty, rate, value]) => acc + value,
    0,
  );
  bill.subtotals[ChargeType.PerMonth] = bill.lines[ChargeType.PerMonth].reduce(
    (acc, [_, qty, rate, value]) => acc + value,
    0,
  );

  bill.lines[ChargeType.Tax] = charges
    .filter((charge) => charge.type === ChargeType.Tax)
    .map((charge) => {
      const taxable =
        bill.subtotals[ChargeType.PerTherm] +
        bill.subtotals[ChargeType.PerMonth];

      return line(
        `${charge.name} $${taxable.toFixed(2)} @ ${(charge.rate * 100).toFixed(
          0,
        )}%`,
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
    marketRates: Record<Market, FixedArray<number, 12>>,
  ): Bill {
    return createBill(offer, month, usage, charges, marketRates);
  }
}
