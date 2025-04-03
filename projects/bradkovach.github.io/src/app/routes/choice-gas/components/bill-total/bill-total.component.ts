import type { Bill } from '../../entity/Bill';
import type { Offer } from '../../entity/Offer';

import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { ChargeType } from '../../entity/ChargeType';
import { Month, monthLabels } from '../../data/enum/month.enum';

@Component({
    imports: [DecimalPipe, RouterLink],
    selector: 'app-bill-total',
    styleUrl: './bill-total.component.scss',
    templateUrl: './bill-total.component.html'
})
export class BillTotalComponent {
	bill = input.required<Bill>();
	readonly ChargeType = ChargeType;
	readonly Month = Month;

	readonly MonthLabels = monthLabels;
	offer = input.required<Offer>();
	show = input<'dollarsPerTherm' | 'thermsPerDollar' | 'total'>('total');
}
