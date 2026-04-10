import type { PipeTransform } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { Component, input, Pipe } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Month } from '../../../data/enum/month.enum';
import type { Bill } from '../../../entity/Bill';
import type { OfferWithBills } from '../explorer.component';

import { ChargeType } from '../../../entity/ChargeType';

@Pipe({
	name: 'billDetail',
	pure: true,
	standalone: true,
})
export class BillDetailPipe implements PipeTransform {
	transform(bill: Bill): string {
		const lines: string[] = [
			'Per-Therm Charges: ' +
				bill.subtotals[ChargeType.PerTherm].toFixed(2),
			'Per-Month Charges: ' +
				bill.subtotals[ChargeType.PerMonth].toFixed(2),
			'Tax: ' + bill.subtotals[ChargeType.Tax].toFixed(2),
			`Total: $${bill.total.toFixed(2)}`,
		];

		return lines.join('\n');
	}
}

@Component({
	imports: [DecimalPipe, RouterLink, BillDetailPipe],
	selector: `td[billCell], th[billCell]`,
	styles: `
		:host {
			background-color: var(--heat-color, inherit);
			text-align: right;
		}
		a:link {
			color: var(--heat-contrast-color, currentColor);
			text-decoration: none;
			border-bottom: 1px dashed currentColor;
		}
		a:visited {
			font-style: italic;
			color: var(--heat-contrast-color, currentColor);
		}
	`,
	template: `
		@let bills = offerWithBills().bills;
		@let offer = offerWithBills().offer;
		@let bill = bills[month()];
		<a
			[routerLink]="['../vendors', offer.vendor_id, 'offers', offer.id]"
			title="{{ bill | billDetail }}">
			{{ bill.total | number: '1.2-2' }}
		</a>
	`,
})
export class BillCell {
	readonly month = input.required<Month>();
	readonly offerWithBills = input.required<OfferWithBills>();
}
