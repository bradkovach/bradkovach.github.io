import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

import type { Averages, OfferWithBills } from '../explorer.component';

import { monthLabels } from '../../../data/enum/month.enum';
import { BillCell } from '../bill-cell/bill-cell.component';
import { ExplorerColumn } from '../ExplorerColumn';
import { extractKeys } from '../extractKeys';
import { RateCell } from '../rate-cell/rate-cell.component';

@Component({
	imports: [RateCell, BillCell, DecimalPipe],
	selector: 'tr[offerWithBills]',
	styles: ``,
	template: `
		@let offer = offerWithBills().offer;
		@if (enabledColumns().has(ExplorerColumn.Name)) {
			<td>{{ offer.name }}</td>
		}
		@if (enabledColumns().has(ExplorerColumn.CommmodityCharge)) {
			<td rateCell [offer]="offer"></td>
		}
		@if (enabledColumns().has(ExplorerColumn.Term)) {
			<td>{{ offer.term }} yr</td>
		}
		@if (enabledColumns().has(ExplorerColumn.ConfirmationCode)) {
			<td>{{ offer.confirmationCode }}</td>
		}
		@if (enabledColumns().has(ExplorerColumn.Average)) {
			<td>{{ offerWithBills().statistics.average | number: '1.2-2' }}</td>
		}
		@if (enabledColumns().has(ExplorerColumn.Month)) {
			@for (month of Months; track $index) {
				<td
					billCell
					[offerWithBills]="offerWithBills()"
					[month]="month"></td>
			} @empty {
				<td colspan="12"><em>No bills available</em></td>
			}
		}
	`,
})
export class OfferRow {
	readonly enabledColumns = input.required<Set<ExplorerColumn>>();
	readonly ExplorerColumn = ExplorerColumn;
	readonly globalAverages = input.required<Averages>();
	readonly Months = extractKeys(monthLabels);
	readonly offerWithBills = input.required<OfferWithBills>();
	readonly vendorAverages = input.required<Averages>();
}
