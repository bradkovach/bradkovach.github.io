import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

import type { Bill } from '../../entity/Bill';

import { ChargeType } from '../../entity/ChargeType';

@Component({
	imports: [DecimalPipe],
	selector: 'app-bill',
	styleUrl: './bill.component.scss',
	templateUrl: './bill.component.html',
})
export class BillComponent {
	bill = input.required<Bill>();

	readonly ChargeType = ChargeType;
}
