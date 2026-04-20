import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import type { Bill } from '../../entity/Bill';
import type { Vendor } from '../../entity/Vendor';
import type { AnyOffer } from '../../schema/offer.z';

import { Series } from '../../data/data.default';
import { lastUpdated } from '../../data/last-updated';
import { createBill } from '../../helpers/create-bill/create-bill';
import { AveragePipe } from '../../pipes/average/average.pipe';
import { DataService, EnrollmentField } from '../../services/data/data.service';
import { FootnotesComponent } from '../../services/footnote/footnote.service';
import { ExplorerSettingsComponent } from './explorer-settings/explorer-settings.component';
import { PreferencesService } from './preferences.service';
import { SeriesSectionComponent } from './series-section/series-section.component';
import { VendorSection } from './vendor-section/vendor-section.component';

// const offerOrder: OfferType[] = [
// 	'market',
// 	'fpt',
// 	'fpm',
// 	'best',
// 	'blended',
// 	'custom',
// ];

export type Averages = {
	high: number;
	low: number;
};

export type ExplorerViewModel = {
	billAverages: MinMax;
	billTotals: MinMax;
	series: Record<Series, number[]>;
	totals: number[];

	vendorsWithOfferRows: VendorWithOfferRows[];
};

export type MinMax = {
	all: number[];
	max: number;
	median: number;
	min: number;
};

export type OfferWithBills = {
	billAverage: number;
	bills: Bill[];
	max: number;
	min: number;
	offer: AnyOffer;
	// offerStatistics: Stat;
};

export type Stat = {
	average: number;
	count: number;
	high: number;
	low: number;
};

export type VendorWithOfferRows = {
	billAverages: MinMax;
	billExtremes: MinMax;
	offersWithBills: OfferWithBills[];
	vendor: Vendor;
};

const getMedian = (numbers: number[]) => {
	const sorted = [...numbers].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 !== 0
		? sorted[mid]
		: (sorted[mid - 1] + sorted[mid]) / 2;
};

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		RouterLink,
		AveragePipe,
		ExplorerSettingsComponent,
		SeriesSectionComponent,
		VendorSection,
		FootnotesComponent,
	],
	selector: 'app-choice-gas-calculator',
	styleUrls: [`./explorer.component.scss`],
	templateUrl: './explorer.component.html',
})
export class ExplorerComponent {
	readonly #dataService = inject(DataService);

	// readonly dataSets = computed(() => {
	// 	return [
	// 		new DataSeries(
	// 			marketLabels[Market.CIG],
	// 			'CIG',
	// 			this.#dataService.series()[Series.CIG],
	// 		),
	// 		new DataSeries(
	// 			SeriesLabels[Series.GCA],
	// 			'GCA',
	// 			this.#dataService.series()[Series.GCA],
	// 		),
	// 		new DataSeries(
	// 			SeriesLabels[Series.TemperatureHigh],
	// 			'Temp High',
	// 			this.#dataService.series()[Series.TemperatureHigh],
	// 		),
	// 		new DataSeries(
	// 			SeriesLabels[Series.TemperatureLow],
	// 			'Temp Low',
	// 			this.#dataService.series()[Series.TemperatureLow],
	// 		),
	// 		new DataSeries(
	// 			SeriesLabels[Series.Usage],
	// 			'Usage',
	// 			this.#dataService.series()[Series.Usage],
	// 		),
	// 	];
	// });

	readonly enrollmentFields = this.#dataService.enrollmentFields;

	readonly Enums = {
		EnrollmentField,
		Series,
	};

	readonly lastUpdated = new Date(lastUpdated);

	readonly preferences = inject(PreferencesService);

	readonly viewModel = computed<ExplorerViewModel>(() => {
		const vendors = this.#dataService.vendors().map((vendor) => {
			const offers = vendor
				.getOffersArray()
				.filter((offer) => this.preferences.OfferTypes()[offer.type])
				.map((offer) => {
					const bills = this.#dataService
						.series()
						[
							Series.Usage
						].map((_, i) => createBill(offer, i, this.#dataService.series()[Series.Usage], this.#dataService.charges(), this.#dataService.series()));

					return {
						billAverage:
							bills.reduce((sum, bill) => sum + bill.total, 0) /
							bills.length,
						bills,
						max: Math.max(...bills.map((bill) => bill.total)),
						min: Math.min(...bills.map((bill) => bill.total)),
						offer,
					};
				})
				.sort((a, b) => a.billAverage - b.billAverage);

			const offersWithRate = offers.filter((o) => {
				if (o.offer.type === 'fpm') {
					return o.offer.rate !== null && o.offer.rate !== undefined;
				}
				return true;
			});
			const vendorBillTotals = offersWithRate
				.flatMap((offer) => offer.bills.map((bill) => bill.total))
				.sort((a, b) => a - b);
			const billAverages = offersWithRate.map((o) => o.billAverage);

			return {
				billAverages: {
					all: billAverages,
					max: Math.max(...billAverages),
					median: getMedian(billAverages),
					min: Math.min(...billAverages),
				},
				billExtremes: {
					all: vendorBillTotals,
					max: Math.max(...vendorBillTotals),
					median: getMedian(vendorBillTotals),
					min: Math.min(...vendorBillTotals),
				},
				offersWithBills: offers,

				vendor,
			};
		});

		const globalBillTotals = vendors
			.flatMap((vendor) =>
				vendor.offersWithBills.flatMap((offerWithBills) =>
					offerWithBills.bills.map((bill) => bill.total),
				),
			)
			.sort((a, b) => a - b);

		const globalBillAverages = vendors
			.flatMap((vendor) =>
				vendor.offersWithBills.map(
					(offerWithBill) => offerWithBill.billAverage,
				),
			)
			.sort((a, b) => a - b);

		return {
			billAverages: {
				all: globalBillAverages,
				max: Math.max(...vendors.map((v) => v.billAverages.max)),
				median: getMedian(globalBillAverages),
				min: Math.min(...vendors.map((v) => v.billAverages.min)),
			},
			billTotals: {
				all: globalBillTotals,
				max: Math.max(...globalBillTotals),
				median: getMedian(globalBillTotals),
				min: Math.min(...globalBillTotals),
			},
			series: this.#dataService.series(),
			totals: globalBillTotals,
			vendorsWithOfferRows: vendors,
		} as ExplorerViewModel;
	});

	readonly #title = inject(Title);

	constructor() {
		this.#title.setTitle('Price Explorer');
	}
}
