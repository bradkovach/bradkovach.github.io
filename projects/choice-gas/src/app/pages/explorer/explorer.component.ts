import { AsyncPipe, DecimalPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { storageSignal } from 'ngx-oneforall/signals/storage-signal';
import { combineLatest, map, tap } from 'rxjs';

import type { OfferType } from '../../schema/offer.z';

import { BillTotalComponent } from '../../components/bill-total/bill-total.component';
import { marketLabels } from '../../data/data.current';
import { Series, SeriesKeys, SeriesLabels } from '../../data/data.default';
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
import { ChargeType } from '../../entity/ChargeType';
import { createBill } from '../../helpers/create-bill/create-bill';
import { AveragePipe } from '../../pipes/average/average.pipe';
import { EnrollmentLinkPipe } from '../../pipes/enrollment-link/enrollment-link.pipe';
import { HeatPipe } from '../../pipes/heat/heat.pipe';
import { PhonePipe } from '../../pipes/phone/phone.pipe';
import { SortPipe } from '../../pipes/sort/sort.pipe';
import { DataService, EnrollmentField } from '../../services/data/data.service';
import { ExplorerColumn, explorerColumnLabels } from './ExplorerColumn';
import { Footnote, footnoteExplanations, footnoteSymbols } from './Footnote';

const extractKeys = <T extends number | string>(
	enumRecord: Record<T, unknown>,
) => Object.keys(enumRecord).map((key) => Number(key) as unknown as T);

const offerOrder: OfferType[] = [
	'market',
	'fpt',
	'fpm',
	'best',
	'blended',
	'custom',
];

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		FormsModule,
		DecimalPipe,
		AsyncPipe,
		RouterLink,
		AveragePipe,
		PhonePipe,
		HeatPipe,
		SortPipe,
		BillTotalComponent,
		EnrollmentLinkPipe,
	],
	selector: 'app-choice-gas-calculator',
	styleUrls: [`./explorer.component.scss`],
	templateUrl: './explorer.component.html',
})
export class ExplorerComponent {
	readonly enabledColumns = storageSignal<Record<ExplorerColumn, boolean>>(
		Setting.ShowColumns,
		{
			[ExplorerColumn.Average]: true,
			[ExplorerColumn.CommmodityCharge]: true,
			[ExplorerColumn.ConfirmationCode]: true,
			[ExplorerColumn.Month]: true,
			[ExplorerColumn.Name]: true,
			[ExplorerColumn.Term]: true,
		},
	);

	readonly ExplorerColumns = extractKeys(explorerColumnLabels);

	readonly enabledColumnsArray = computed(() =>
		this.ExplorerColumns.filter((column) => this.enabledColumns()[column]),
	);

	// #region Storage Signals
	readonly enabledOfferTypes = storageSignal<Record<OfferType, boolean>>(
		Setting.EnabledOfferTypes,
		{
			best: true,
			blended: true,
			custom: true,
			fpm: true,
			fpt: true,
			market: true,
		},
	);
	readonly enabledSeries = storageSignal<Record<Series, boolean>>(
		Setting.ShowSeries,
		{
			[Series.CIG]: false,
			[Series.GCA]: false,
			[Series.TemperatureHigh]: false,
			[Series.TemperatureLow]: true,
			[Series.Usage]: true,
		},
	);

	readonly enableHighDensityTable = storageSignal<boolean>(
		Setting.EnableHighDensityTable,
		false,
	);

	readonly enableStripedTable = storageSignal<boolean>(
		Setting.EnableStripedTable,
		true,
	);

	// readonly EnrollmentField = EnrollmentField;
	readonly #dataService = inject(DataService);

	readonly enrollmentFields = this.#dataService.enrollmentFields;
	// #endregion

	readonly Enums = {
		ChargeType,
		EnrollmentField,
		ExplorerColumn,
		Footnote,
		Heatmap,
		HeatmapScheme,
	};
	readonly ExplorerColumnLabels = explorerColumnLabels;

	readonly footnoteExplanations = footnoteExplanations;
	readonly footnoteSymbols = footnoteSymbols;

	readonly HeatmapLabels: Record<Heatmap, string> = heatmapsLabels;
	readonly Heatmaps = extractKeys(heatmapsLabels);
	readonly HeatmapSchemeLabels: Record<HeatmapScheme, string> =
		heatmapSchemeLabels;

	readonly HeatmapSchemes = extractKeys(heatmapSchemeLabels);

	readonly heatmapsEnabled = storageSignal<Record<Heatmap, boolean>>(
		Setting.EnabledHeatmaps,
		{
			[Heatmap.Averages]: true,
			[Heatmap.Series]: true,
			[Heatmap.Totals]: true,
		},
	);

	readonly offerAverages = signal<number[]>([]);

	// #region Computed Signals
	readonly highest = computed(() => {
		const avgs = this.offerAverages();
		return avgs.length > 0 ? avgs[avgs.length - 1] : Number.MIN_VALUE;
	});

	// #endregion
	readonly Keys = {};

	readonly Labels = {
		explorerColumnLabels,
	};

	readonly lastUpdated = new Date(lastUpdated);
	readonly lowest = computed(() =>
		this.offerAverages().length > 0
			? this.offerAverages()[0]
			: Number.MAX_VALUE,
	);

	// #region Market
	readonly Market = Market;

	readonly MarketLabels = marketLabels;

	readonly Markets = Object.keys(marketLabels) as unknown as Market[];

	// #region Month
	readonly Month = Month;

	readonly MonthLabels = monthLabels;

	readonly monthLabelsAbbr = monthLabelsAbbr;

	readonly Months = Object.keys(monthLabels) as unknown as Month[];

	// #region OfferType
	readonly OfferTypeLabels: Record<OfferType, string> = offerTypeLabels;

	readonly OfferTypes = Object.keys(
		offerTypeLabels,
	) as unknown as OfferType[];

	readonly palette = computed(() => heatmapSchemePalettes[this.scheme()]);
	// #endregion

	readonly scheme = storageSignal<HeatmapScheme>(
		Setting.Scheme,
		HeatmapScheme.GreenWhiteRed,
		{},
	);

	// Series does not have a single/plural so the use of Keys and Labels suffixes is required here
	// #region Series
	readonly Series = Series;

	readonly seriesAverages = computed(() => {
		const values = this.#dataService.series();
		return SeriesKeys.reduce<Record<Series, number>>(
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
	//#endregions

	readonly SeriesKeys = SeriesKeys;

	readonly SeriesLabels = SeriesLabels;

	showSettings = signal(false);
	readonly valueTotals = signal<number[]>([]);

	readonly vm$ = combineLatest({
		charges: this.#dataService.charges$,
		enabledOfferTypes: toObservable(this.enabledOfferTypes),
		series: this.#dataService.series$,
		vendors: this.#dataService.vendors$,
	}).pipe(
		map((vm) => {
			return {
				...vm,
				vendors: vm.vendors.map((vendor) => {
					const offers = [...vendor.offers.values()]
						.sort(
							(a, b) =>
								offerOrder.indexOf(a.type) -
								offerOrder.indexOf(b.type),
						)
						.filter((offer) => this.enabledOfferTypes()[offer.type])
						.map((offer) => ({
							average: 0,
							bills: vm.series[Series.Usage]
								.map((_, i) =>
									createBill(
										offer,
										i,
										vm.series[Series.Usage],
										vm.charges,
										vm.series,
									),
								)
								.map((bill) => ({ bill, rankInYear: -1 }))
								// sort by total, ascending
								.sort((a, b) => a.bill.total - b.bill.total)
								// project to include rank
								.map((ranked, i) => {
									return { bill: ranked.bill, rank: i + 1 };
								})
								// sort by bill month, ascending
								.sort((a, b) => a.bill.month - b.bill.month),
							offer,
						}))
						.map((vendorGroup) => {
							const yearTotal = vendorGroup.bills.reduce(
								(sum, { bill }) => sum + bill.total,
								0,
							);
							vendorGroup.average =
								yearTotal / vendorGroup.bills.length;
							return vendorGroup;
						});
					// .sort((a, b) => a.average - b.average);

					return {
						offers,
						vendor: vendor,
					};
				}),
			};
		}),
		tap((vm) => {
			this.valueTotals.set(
				vm.vendors.flatMap((vendor) =>
					vendor.offers
						.filter((o) => {
							if (o.offer.type === 'fpm' && o.offer.rate === 0) {
								return false;
							}
							return true;
						})
						.flatMap((offer) =>
							offer.bills.flatMap((b) => b.bill.total),
						)
						// ascending
						.sort((a, b) => a - b),
				),
			);

			// console.log(
			// 	'rows',
			// 	vm.vendors.flatMap((vendor) => vendor.offers).length,
			// );

			this.offerAverages.set(
				vm.vendors
					.flatMap((vendor) =>
						vendor.offers
							.filter((o) => {
								if (
									o.offer.type === 'fpm' &&
									o.offer.rate === 0
								) {
									return false;
								}
								return true;
							})
							.map((offer) => offer.average),
					)
					// ascending
					.sort((a, b) => a - b),
			);
		}),
	);

	private readonly title = inject(Title);

	constructor() {
		this.title.setTitle('Choice Gas - Price Explorer');
	}

	resetRefiners() {
		this.enabledSeries.set({
			[Series.CIG]: false,
			[Series.GCA]: false,
			[Series.TemperatureHigh]: false,
			[Series.TemperatureLow]: false,
			[Series.Usage]: true,
		});
		this.enabledOfferTypes.set({
			best: true,
			blended: true,
			custom: true,
			fpm: true,
			fpt: true,
			market: true,
		});
		this.enabledColumns.set({
			[ExplorerColumn.Average]: true,
			[ExplorerColumn.CommmodityCharge]: true,
			[ExplorerColumn.ConfirmationCode]: true,
			[ExplorerColumn.Month]: true,
			[ExplorerColumn.Name]: true,
			[ExplorerColumn.Term]: true,
		});
		this.heatmapsEnabled.set({
			[Heatmap.Averages]: true,
			[Heatmap.Series]: true,
			[Heatmap.Totals]: true,
		});
	}

	setColumn(column: ExplorerColumn, enabled: boolean) {
		this.enabledColumns.set({
			...this.enabledColumns(),
			[column]: enabled,
		});
	}

	setHeatmap(heatmap: Heatmap, enabled: boolean) {
		this.heatmapsEnabled.set({
			...this.heatmapsEnabled(),
			[heatmap]: enabled,
		});
	}

	setOfferType(offerType: OfferType, enabled: boolean) {
		this.enabledOfferTypes.set({
			...this.enabledOfferTypes(),
			[offerType]: enabled,
		});
	}

	setSeries(series: Series, enabled: boolean) {
		this.enabledSeries.set({
			...this.enabledSeries(),
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
