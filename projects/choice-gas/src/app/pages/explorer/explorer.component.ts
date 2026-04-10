import { DecimalPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { storageSignal } from 'ngx-oneforall/signals/storage-signal';

import type { AnyOffer, OfferType } from '../../schema/offer.z';

import { marketLabels } from '../../data/data.current';
import { Series, SeriesLabels } from '../../data/data.default';
import {
	Heatmap,
	HeatmapScheme,
	heatmapSchemeLabels,
	heatmapSchemePalettes,
	heatmapsLabels,
} from '../../data/enum/heatmap.enum';
import {
	Month,
	monthLabels,
	monthLabelsAbbr,
} from '../../data/enum/month.enum';
import { Setting } from '../../data/enum/settings.enum';
import { lastUpdated } from '../../data/last-updated';
import { Market } from '../../data/Market';
import type { Bill } from '../../entity/Bill';
import { ChargeType } from '../../entity/ChargeType';
import { Vendor } from '../../entity/Vendor';
import { createBill } from '../../helpers/create-bill/create-bill';
import { AveragePipe } from '../../pipes/average/average.pipe';
import { HeatPipe } from '../../pipes/heat/heat.pipe';
import { SortPipe } from '../../pipes/sort/sort.pipe';
import { DataService, EnrollmentField } from '../../services/data/data.service';
import { ExplorerColumn, explorerColumnLabels } from './ExplorerColumn';
import { extractKeys } from './extractKeys';
import { Footnote, footnoteExplanations, footnoteSymbols } from './Footnote';
import { VendorSection } from './vendor-section/vendor-section.component';

const offerOrder: OfferType[] = [
	'market',
	'fpt',
	'fpm',
	'best',
	'blended',
	'custom',
];

export type Stat = {
	high: number;
	low: number;
	average: number;
	count: number;
};

export type Averages = {
	high: number;
	low: number;
};

export type OfferWithBills = {
	offer: AnyOffer;
	statistics: Stat;
	bills: Bill[];
};

export type VendorWithOfferRows = {
	vendor: Vendor;
	statistics: Stat;
	vendorAverages: Averages;
	offersWithBills: OfferWithBills[];
};

export type ExplorerViewModel = {
	vendorsWithOfferRows: VendorWithOfferRows[];
	statistics: Stat;
	globalAverages: Averages;
	series: Record<Series, number[]>;
};

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		FormsModule,
		DecimalPipe,
		RouterLink,
		AveragePipe,
		HeatPipe,
		SortPipe,
		VendorSection,
	],
	selector: 'app-choice-gas-calculator',
	styleUrls: [`./explorer.component.scss`],
	templateUrl: './explorer.component.html',
})
export class ExplorerComponent {
	readonly Strings = {
		explorerColumnLabels,
		footnoteExplanations,
		footnoteSymbols,
		heatmapSchemeLabels,
		heatmapSchemePalettes: heatmapSchemePalettes,
		heatmapsLabels,
		marketLabels,
		monthLabels,
		monthLabelsAbbr,
		offerTypeLabels: offerTypeLabels,
		seriesLabels: SeriesLabels,
	};

	readonly EnumArrays = {
		ExplorerColumns: extractKeys(this.Strings.explorerColumnLabels),
		Heatmaps: extractKeys(this.Strings.heatmapsLabels),
		HeatmapSchemes: extractKeys(this.Strings.heatmapSchemeLabels),
		Markets: extractKeys(this.Strings.marketLabels),
		Months: extractKeys(this.Strings.monthLabels),
		OfferTypes: Object.keys(this.Strings.offerTypeLabels) as OfferType[],
		SeriesKeys: extractKeys(this.Strings.seriesLabels),
	};

	readonly storageSignals = {
		Columns: storageSignal<Record<ExplorerColumn, boolean>>(
			Setting.ShowColumns,
			{
				[ExplorerColumn.Average]: true,
				[ExplorerColumn.CommmodityCharge]: true,
				[ExplorerColumn.ConfirmationCode]: true,
				[ExplorerColumn.Month]: true,
				[ExplorerColumn.Name]: true,
				[ExplorerColumn.Term]: true,
			},
		),
		Heatmaps: storageSignal<Record<Heatmap, boolean>>(
			Setting.EnabledHeatmaps,
			{
				[Heatmap.Averages]: true,
				[Heatmap.Series]: true,
				[Heatmap.Totals]: true,
			},
		),
		// 	readonly scheme = storageSignal<HeatmapScheme>(
		// 	Setting.Scheme,
		// 	HeatmapScheme.GreenWhiteRed,
		// 	{},
		// );
		HeatmapScheme: storageSignal<HeatmapScheme>(
			Setting.Scheme,
			HeatmapScheme.GreenWhiteRed,
		),
		HighDensityTable: storageSignal<boolean>(
			Setting.EnableHighDensityTable,
			false,
		),
		OfferTypes: storageSignal<Record<OfferType, boolean>>(
			Setting.EnabledOfferTypes,
			{
				best: true,
				blended: true,
				custom: true,
				fpm: true,
				fpt: true,
				market: true,
			},
		),
		Series: storageSignal<Record<Series, boolean>>(Setting.ShowSeries, {
			[Series.CIG]: false,
			[Series.GCA]: false,
			[Series.TemperatureHigh]: false,
			[Series.TemperatureLow]: true,
			[Series.Usage]: true,
		}),
		StripedTable: storageSignal<boolean>(Setting.EnableStripedTable, true),
	};

	readonly enabledColumnsArray = computed(() =>
		this.EnumArrays.ExplorerColumns.filter(
			(column) => this.storageSignals.Columns()[column],
		),
	);

	readonly enabledColumnsSet = computed(
		() =>
			new Set(
				this.EnumArrays.ExplorerColumns.filter(
					(column) => this.storageSignals.Columns()[column],
				),
			),
		{
			equal: (prev, next) => false,
		},
	);

	readonly #dataService = inject(DataService);

	readonly enrollmentFields = this.#dataService.enrollmentFields;

	readonly Enums = {
		ChargeType,
		EnrollmentField,
		ExplorerColumn,
		Footnote,
		Heatmap,
		HeatmapScheme,
		Market,
		Month,
		Series,
	};

	readonly offerAverages = signal<number[]>([]);

	readonly highest = computed(() => {
		const avgs = this.offerAverages();
		return avgs.length > 0 ? avgs[avgs.length - 1] : Number.MIN_VALUE;
	});

	readonly lastUpdated = new Date(lastUpdated);

	readonly lowest = computed(() =>
		this.offerAverages().length > 0
			? this.offerAverages()[0]
			: Number.MAX_VALUE,
	);

	readonly palette = computed(
		() => heatmapSchemePalettes[this.storageSignals.HeatmapScheme()],
	);

	readonly seriesAverages = computed(() => {
		const values = this.#dataService.series();
		return this.EnumArrays.SeriesKeys.reduce<Record<Series, number>>(
			(avgs, key) => {
				const series = values[key];
				avgs[key] =
					series.reduce((sum, value) => sum + value, 0) /
					series.length;
				return avgs;
			},
			{
				[Series.CIG]: 0,
				[Series.GCA]: 0,
				[Series.TemperatureHigh]: 0,
				[Series.TemperatureLow]: 0,
				[Series.Usage]: 0,
			},
		);
	});

	readonly SeriesDirections: Record<Series, -1 | 1> = {
		[Series.CIG]: 1,
		[Series.GCA]: 1,
		[Series.TemperatureHigh]: 1,
		[Series.TemperatureLow]: -1,
		[Series.Usage]: 1,
	};

	readonly showSettings = signal(false);
	readonly valueTotals = signal<number[]>([]);

	readonly viewModel = computed<ExplorerViewModel>(() => {
		const vendors = this.#dataService.vendors().map((vendor) => {
			const offers = vendor
				.getOffersArray()
				.filter((offer) => this.storageSignals.OfferTypes()[offer.type])
				.map((offer) => {
					const bills = this.#dataService
						.series()
						[
							Series.Usage
						].map((_, i) => createBill(offer, i, this.#dataService.series()[Series.Usage], this.#dataService.charges(), this.#dataService.series()));

					return {
						offer,
						bills,
						statistics: {
							high: Math.max(...bills.map((bill) => bill.total)),
							low: Math.min(...bills.map((bill) => bill.total)),
							average:
								bills.reduce(
									(sum, bill) => sum + bill.total,
									0,
								) / bills.length,
							count: bills.length,
						},
					};
				});

			const vendorBillTotals = offers.flatMap((offer) =>
				offer.bills.map((bill) => bill.total),
			);

			return {
				vendor,
				offersWithBills: offers,
				vendorAverages: {
					high: Math.max(...offers.map((o) => o.statistics.average)),
					low: Math.min(...offers.map((o) => o.statistics.average)),
				},
				statistics: {
					high: Math.max(...vendorBillTotals),
					low: Math.min(...vendorBillTotals),
					average:
						vendorBillTotals.reduce(
							(sum, total) => sum + total,
							0,
						) / vendorBillTotals.length,
					count: vendorBillTotals.length,
				},
			};
		});

		const globalBillTotals = vendors.flatMap((vendor) =>
			vendor.offersWithBills.flatMap((offer) =>
				offer.bills.map((bill) => bill.total),
			),
		);

		return {
			series: this.#dataService.series(),
			vendorsWithOfferRows: vendors,
			globalAverages: {
				high: Math.max(...vendors.map((v) => v.statistics.average)),
				low: Math.min(...vendors.map((v) => v.statistics.average)),
			},
			statistics: {
				high: Math.max(...globalBillTotals),
				low: Math.min(...globalBillTotals),
				average:
					globalBillTotals.reduce((sum, total) => sum + total, 0) /
					globalBillTotals.length,
				count: globalBillTotals.length,
			},
		};
	});

	readonly tableColumnCount = computed(() => {
		let columns = 0;

		const enabledColumns = this.storageSignals.Columns();

		if (enabledColumns[ExplorerColumn.Name]) columns++;
		if (enabledColumns[ExplorerColumn.CommmodityCharge]) columns++;
		if (enabledColumns[ExplorerColumn.Term]) columns++;
		if (enabledColumns[ExplorerColumn.ConfirmationCode]) columns++;
		if (enabledColumns[ExplorerColumn.Average]) columns++;
		if (enabledColumns[ExplorerColumn.Month]) columns += 12;

		return columns;
	});

	// readonly #vm$ = combineLatest({
	// 	charges: this.#dataService.charges$,
	// 	enabledOfferTypes: toObservable(this.storageSignals.OfferTypes),
	// 	series: this.#dataService.series$,
	// 	vendors: this.#dataService.vendors$,
	// }).pipe(
	// 	map((vm) => {
	// 		return {
	// 			...vm,
	// 			vendors: vm.vendors.map((vendor) => {
	// 				const offers = [...vendor.offers.values()]
	// 					.sort(
	// 						(a, b) =>
	// 							offerOrder.indexOf(a.type) -
	// 							offerOrder.indexOf(b.type),
	// 					)
	// 					.filter(
	// 						(offer) =>
	// 							this.storageSignals.OfferTypes()[offer.type],
	// 					)
	// 					.map((offer) => ({
	// 						average: 0,
	// 						bills: vm.series[Series.Usage]
	// 							.map((_, i) =>
	// 								createBill(
	// 									offer,
	// 									i,
	// 									vm.series[Series.Usage],
	// 									vm.charges,
	// 									vm.series,
	// 								),
	// 							)
	// 							.map((bill) => ({ bill, rankInYear: -1 }))
	// 							// sort by total, ascending
	// 							.sort((a, b) => a.bill.total - b.bill.total)
	// 							// project to include rank
	// 							.map((ranked, i) => {
	// 								return { bill: ranked.bill, rank: i + 1 };
	// 							})
	// 							// sort by bill month, ascending
	// 							.sort((a, b) => a.bill.month - b.bill.month),
	// 						offer,
	// 					}))
	// 					.map((vendorGroup) => {
	// 						const yearTotal = vendorGroup.bills.reduce(
	// 							(sum, { bill }) => sum + bill.total,
	// 							0,
	// 						);
	// 						vendorGroup.average =
	// 							yearTotal / vendorGroup.bills.length;
	// 						return vendorGroup;
	// 					});
	// 				// .sort((a, b) => a.average - b.average);

	// 				return {
	// 					offers,
	// 					vendor: vendor,
	// 				};
	// 			}),
	// 		};
	// 	}),
	// 	tap((vm) => {
	// 		this.valueTotals.set(
	// 			vm.vendors.flatMap((vendor) =>
	// 				vendor.offers
	// 					.filter((o) => {
	// 						if (o.offer.type === 'fpm' && o.offer.rate === 0) {
	// 							return false;
	// 						}
	// 						return true;
	// 					})
	// 					.flatMap((offer) =>
	// 						offer.bills.flatMap((b) => b.bill.total),
	// 					)
	// 					// ascending
	// 					.sort((a, b) => a - b),
	// 			),
	// 		);

	// 		// console.log(
	// 		// 	'rows',
	// 		// 	vm.vendors.flatMap((vendor) => vendor.offers).length,
	// 		// );

	// 		this.offerAverages.set(
	// 			vm.vendors
	// 				.flatMap((vendor) =>
	// 					vendor.offers
	// 						.filter((o) => {
	// 							if (
	// 								o.offer.type === 'fpm' &&
	// 								o.offer.rate === 0
	// 							) {
	// 								return false;
	// 							}
	// 							return true;
	// 						})
	// 						.map((offer) => offer.average),
	// 				)
	// 				// ascending
	// 				.sort((a, b) => a - b),
	// 		);
	// 	}),
	// );

	readonly #title = inject(Title);

	constructor() {
		this.#title.setTitle('Price Explorer');
	}

	resetRefiners() {
		this.storageSignals.Series.set({
			[Series.CIG]: false,
			[Series.GCA]: false,
			[Series.TemperatureHigh]: false,
			[Series.TemperatureLow]: false,
			[Series.Usage]: true,
		});
		this.storageSignals.OfferTypes.set({
			best: true,
			blended: true,
			custom: true,
			fpm: true,
			fpt: true,
			market: true,
		});
		this.storageSignals.Columns.set({
			[ExplorerColumn.Average]: true,
			[ExplorerColumn.CommmodityCharge]: true,
			[ExplorerColumn.ConfirmationCode]: true,
			[ExplorerColumn.Month]: true,
			[ExplorerColumn.Name]: true,
			[ExplorerColumn.Term]: true,
		});
		this.storageSignals.Heatmaps.set({
			[Heatmap.Averages]: true,
			[Heatmap.Series]: true,
			[Heatmap.Totals]: true,
		});
	}

	setColumn(column: ExplorerColumn, enabled: boolean) {
		this.storageSignals.Columns.set({
			...this.storageSignals.Columns(),
			[column]: enabled,
		});
	}

	setHeatmap(heatmap: Heatmap, enabled: boolean) {
		this.storageSignals.Heatmaps.set({
			...this.storageSignals.Heatmaps(),
			[heatmap]: enabled,
		});
	}

	setOfferType(offerType: OfferType, enabled: boolean) {
		this.storageSignals.OfferTypes.set({
			...this.storageSignals.OfferTypes(),
			[offerType]: enabled,
		});
	}

	setSeries(series: Series, enabled: boolean) {
		this.storageSignals.Series.set({
			...this.storageSignals.Series(),
			[series]: enabled,
		});
	}

	setShowSettings(open: boolean) {
		this.showSettings.set(open);
	}
}

const offerTypeLabels = {
	best: 'Best Of',
	blended: 'Blended',
	custom: 'Custom',
	fpm: 'Fixed/Month',
	fpt: 'Fixed/Therm',
	market: 'Market',
};
