import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import chroma from 'chroma-js';

import { monthLabels } from '../../../data/enum/month.enum';
import { HeatDirective } from '../../../directives/heat/heat.directive';
import {
	DataService,
	EnrollmentField,
} from '../../../services/data/data.service';
import { FootnoteComponent } from '../../../services/footnote/footnote.service';
import { HeatmapManager } from '../../../services/heatmap-manager/heatmap-manager.service';
import { BillCell } from '../bill-cell/bill-cell.component';
import { type MinMax, type OfferWithBills } from '../explorer.component';
import { ExplorerColumn } from '../ExplorerColumn';
import { extractKeys } from '../extractKeys';
import { PreferencesService } from '../preferences.service';
import { RateCell } from '../rate-cell/rate-cell.component';

@Component({
	imports: [
		RateCell,
		BillCell,
		DecimalPipe,
		HeatDirective,
		RouterLink,
		FootnoteComponent,
	],
	selector: 'tr[offerRow]',
	styles: `
		.is-global-average-max {
			font-weight: bold;
		}
		.is-global-average-min {
			font-weight: bold;
		}
		.is-vendor-max {
			font-weight: bold;
		}
		.is-vendor-min {
			font-weight: bold;
		}
		.lowest-average {
			box-shadow: inset 0 0 0 2px #00990080;
			font-weight: bold;
		}
		.highest-average {
			box-shadow: inset 0 0 0 2px #00000080;
			font-weight: bold;
		}
	`,
	template: `
		@let offer = offerWithBills().offer;
		@let billCalculated = canCalculateBill();

		@if (preferences.enabledColumns().has(ExplorerColumn.Name)) {
			<td>
				<a
					[routerLink]="[
						'../vendors',
						offer.vendor_id,
						'offers',
						offer.id,
					]">
					{{ offer.name }}</a
				>

				@if (offer.isSpecial) {
					<footnote [text]="messages.specialOffer"></footnote>
				}
				@if (offer.type === 'fpm') {
					<footnote [text]="messages.fixedPerMonth"></footnote>
				}
			</td>
		}

		@if (
			preferences.enabledColumns().has(ExplorerColumn.CommmodityCharge)
		) {
			<td rateCell [offer]="offer"></td>
		}

		@if (preferences.enabledColumns().has(ExplorerColumn.Term)) {
			<td class="text-center">{{ offer.term }} yr</td>
		}

		@if (
			preferences.enabledColumns().has(ExplorerColumn.ConfirmationCode)
		) {
			<td class="text-center">
				@if (!offer.confirmationCode) {
					{{ '- - - ' }} &nbsp;
					<footnote [text]="messages.confirmationCode"></footnote>
				} @else {
					{{ offer.confirmationCode }}
				}
			</td>
		}

		@if (preferences.enabledColumns().has(ExplorerColumn.Average)) {
			<td
				class="text-end"
				[heat]="billCalculated"
				[scale]="scaleAverage()"
				[value]="offerWithBills().billAverage"
				[values]="globalAverages().all"
				[class.highest-average]="
					billCalculated &&
					offerWithBills().billAverage === globalAverages().max
				"
				[class.lowest-average]="
					billCalculated &&
					offerWithBills().billAverage === globalAverages().min
				">
				@if (billCalculated) {
					@if (
						offerWithBills().billAverage === globalAverages().max
					) {
						<footnote [text]="messages.globalAverageMax"></footnote>
					} @else if (
						offerWithBills().billAverage === globalAverages().min
					) {
						<footnote [text]="messages.globalAverageMin"></footnote>
					}
					{{ offerWithBills().billAverage | number: '1.2-2' }}
				} @else {
					<span [title]="messages.editOfferToSeeAverage">- - -</span>
				}
			</td>
		}

		@if (preferences.enabledColumns().has(ExplorerColumn.Month)) {
			@for (month of Months; track $index) {
				<td
					billCell
					[offerWithBills]="offerWithBills()"
					[month]="month"
					[heat]="canCalculateBill()"
					[scale]="scaleTotal()"
					[value]="offerWithBills().bills[month].total"
					[values]="values()"></td>
			} @empty {
				<td colspan="12">
					<em>{{ messages.noBillsAvailable }}</em>
				</td>
			}
		}
	`,
})
export class OfferRow {
	readonly #data = inject(DataService);

	accountNumber = computed(
		() => this.#data.enrollmentFields()[EnrollmentField.AccountNumber],
	);

	readonly offerWithBills = input.required<OfferWithBills>();

	readonly canCalculateBill = computed(() => {
		const offer = this.offerWithBills().offer;
		if (offer.type === 'fpm') {
			return offer.rate !== null && offer.rate !== undefined;
		}
		return true;
	});

	controlNumber = computed(
		() => this.#data.enrollmentFields()[EnrollmentField.ControlNumber],
	);

	readonly ExplorerColumn = ExplorerColumn;

	readonly globalAverages = input.required<MinMax>();

	readonly globalExtremes = input.required<MinMax>();

	readonly messages = {
		confirmationCode: [
			'This supplier has not published a confirmation code for this rate.',
			'To select this offer, contact the supplier directly.',
		].join(' '),
		editOfferToSeeAverage: 'Edit offer to see average calculation.',
		fixedPerMonth: [
			'This rate is a fixed price per month, and the rate is offered per-household.',
			'To see the rate that you would pay, contact the supplier and click Edit Rate to add your rate data to the Price Explorer.',
		].join(' '),
		globalAverageMax: 'This is the highest average rate among all offers.',
		globalAverageMin: 'This is the lowest average rate among all offers.',
		noBillsAvailable: 'No bills available.',
		specialOffer:
			'This is a special rate offer, and may not be available to all customers.',
	};
	readonly Months = extractKeys(monthLabels);

	readonly preferences = inject(PreferencesService);

	readonly #heatmapManager = inject(HeatmapManager);

	readonly scaleAverage = computed(() => {
		const domain = [
			this.globalAverages().min,
			this.globalAverages().median,
			this.globalAverages().max,
		];
		return chroma.scale(this.#heatmapManager.palette()).domain(domain);
	});

	readonly scaleTotal = computed(() => {
		const domain = [
			this.globalExtremes().min,
			this.globalExtremes().median,
			this.globalExtremes().max,
		];
		return chroma.scale(this.#heatmapManager.palette()).domain(domain);
	});

	readonly totals = computed(() => this.globalExtremes().all);

	readonly values = input.required<number[]>();
	readonly vendorAverages = input.required<MinMax>();
}
