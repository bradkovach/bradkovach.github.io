import { Component, computed, inject, input } from '@angular/core';

import { PhonePipe } from '../../../pipes/phone/phone.pipe';
import { FootnoteComponent } from '../../../services/footnote/footnote.service';
import { type MinMax, type VendorWithOfferRows } from '../explorer.component';
import { ExplorerColumn } from '../ExplorerColumn';
import { OfferRow } from '../offer-row/offer-row.component';
import { PreferencesService } from '../preferences.service';

@Component({
	// imports: [RouterLink],
	imports: [PhonePipe, OfferRow, FootnoteComponent],
	selector: 'tbody[vendorSection]',
	styles: ``,
	template: `
		@let vendor = vendorWithOfferRows().vendor;
		@let vendorAverages = vendorWithOfferRows().billAverages;
		@let offersWithBills = vendorWithOfferRows().offersWithBills;
		@let columnSet = preferences.enabledColumns();
		<tr>
			<th>
				{{ vendor.name }}
				@if (vendor.automated) {
					<footnote [text]="messages.automated"></footnote>
				}
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
				offerRow
				[offerWithBills]="offerWithBills"
				[vendorAverages]="vendorAverages"
				[globalAverages]="globalAverages()"
				[globalExtremes]="globalExtremes()"
				[values]="values()"></tr>
		} @empty {
			<tr>
				<td [attr.colspan]="preferences.tableColumnCount()">
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
	readonly ExplorerColumn = ExplorerColumn;
	readonly globalAverages = input.required<MinMax>();
	readonly globalExtremes = input.required<MinMax>();
	readonly messages = {
		automated: ["This vendor's offers are automatically updated."].join(
			' ',
		),
	};
	readonly preferences = inject(PreferencesService);
	readonly values = input.required<number[]>();
	readonly vendorWithOfferRows = input.required<VendorWithOfferRows>();

	readonly websiteColumnSpan = computed(() => {
		let colspan = this.preferences.tableColumnCount();

		const enabledColumns = this.preferences.enabledColumns();
		if (enabledColumns.has(ExplorerColumn.Name)) {
			colspan--;
		}
		if (enabledColumns.has(ExplorerColumn.CommmodityCharge)) {
			colspan--;
		}

		return colspan;
	});
}
