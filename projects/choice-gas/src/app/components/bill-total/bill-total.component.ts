import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Bill } from '../../entity/Bill';
import type { AnyOffer } from '../../schema/offer.z';

import { Month, monthLabels } from '../../data/enum/month.enum';
import { ChargeType } from '../../entity/ChargeType';

@Component({
	imports: [DecimalPipe, RouterLink],
	selector: 'app-bill-total',
	styleUrl: './bill-total.component.scss',
	templateUrl: './bill-total.component.html',
})
export class BillTotalComponent {
	bill = input.required<Bill>();
	readonly ChargeType = ChargeType;
	readonly Month = Month;

	readonly MonthLabels = monthLabels;
	offer = input.required<AnyOffer>();
	show = input<'dollarsPerTherm' | 'thermsPerDollar' | 'total'>('total');
}
