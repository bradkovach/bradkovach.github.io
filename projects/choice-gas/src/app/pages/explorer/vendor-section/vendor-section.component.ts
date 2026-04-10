import { Component, computed, input } from '@angular/core';
import { PhonePipe } from '../../../pipes/phone/phone.pipe';
import type { Averages, VendorWithOfferRows } from '../explorer.component';
import { ExplorerColumn } from '../ExplorerColumn';
import { OfferRow } from '../offer-row/offer-row.component';

@Component({
	// imports: [RouterLink],
	imports: [PhonePipe, OfferRow],
	selector: 'tbody[vendorWithOfferRows]',
	styles: ``,
	template: `
		@let vendor = vendorWithOfferRows().vendor;
		@let vendorAverages = vendorWithOfferRows().vendorAverages;
		@let offersWithBills = vendorWithOfferRows().offersWithBills;
		@let columnSet = enabledColumns();
		<tr>
			<th>
				{{ vendor.name }}
			</th>

			@if (columnSet.has(ExplorerColumn.CommmodityCharge)) {
				<td>{{ vendor.phone | phone }}</td>
			}

			<td [attr.colspan]="websiteColumnSpan()">
				<a
					href="{{ vendor.website }}"
					target="_blank"
					title="Open {{ vendor.name }} website in a new tab/window"
					>{{ vendor.website }}</a
				>
			</td>
		</tr>

		@for (offerWithBills of offersWithBills; track $index) {
			<tr
				[offerWithBills]="offerWithBills"
				[enabledColumns]="enabledColumns()"
				[vendorAverages]="vendorAverages"
				[globalAverages]="globalAverages()"></tr>
		} @empty {
			<tr>
				<td [attr.colspan]="tableColumnCount()">
					<em
						>There are no offers matching these filter criteria from
						{{ vendor.name }} at this time.</em
					>
				</td>
			</tr>
		}
	`,
})
export class VendorSection {
	readonly vendorWithOfferRows = input.required<VendorWithOfferRows>();
	readonly tableColumnCount = input.required<number>();
	readonly enabledColumns = input.required<Set<ExplorerColumn>>();

	readonly globalAverages = input.required<Averages>();

	readonly websiteColumnSpan = computed(() => {
		let colspan = this.tableColumnCount();

		const enabledColumns = this.enabledColumns();
		if (enabledColumns.has(ExplorerColumn.Name)) {
			colspan--;
		}
		if (enabledColumns.has(ExplorerColumn.CommmodityCharge)) {
			colspan--;
		}

		return colspan;
	});

	readonly ExplorerColumn = ExplorerColumn;
}

@Component({
	selector: 'tbody[extraSeries]',
	styles: ``,
	template: `
		<tr>
			<th>Extra Series</th>
		</tr>
	`,
})
export class ExtraSeriesSection {}
