import type { PipeTransform } from '@angular/core';

import { Pipe } from '@angular/core';

import type { Series } from '../../data/data.default';
import type { Month } from '../../data/enum/month.enum';
import type { Bill } from '../../entity/Bill';
import type { Charge } from '../../entity/Charge';
import type { FixedArray } from '../../entity/FixedArray';
import type { AnyOffer } from '../../schema/offer.z';

import { createBill } from '../../helpers/create-bill/create-bill';

@Pipe({
	name: 'bill',
	standalone: true,
})
export class BillPipe implements PipeTransform {
	transform(
		offer: AnyOffer,
		month: Month,
		usage: FixedArray<number, 12>,
		charges: Charge[],
		marketRates: Record<Series, FixedArray<number, 12>>,
	): Bill {
		return createBill(offer, month, usage, charges, marketRates);
	}
}
