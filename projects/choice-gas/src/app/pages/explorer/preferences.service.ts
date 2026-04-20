import { computed, Injectable } from '@angular/core';
import { storageSignal } from 'ngx-oneforall/signals/storage-signal';

import type { OfferType } from '../../schema/offer.z';

import { Series } from '../../data/data.default';
import { Heatmap } from '../../data/enum/heatmap.enum';
import { Setting } from '../../data/enum/settings.enum';
import { ExplorerColumn } from './ExplorerColumn';
import { extractKeys } from './extractKeys';

@Injectable({
	providedIn: 'root',
})
export class PreferencesService {
	readonly Columns = storageSignal<Record<ExplorerColumn, boolean>>(
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

	readonly enabledColumns = computed(
		() =>
			new Set(
				extractKeys(this.Columns()).filter(
					(column) => this.Columns()[column],
				),
			),
		{
			equal: () => false,
		},
	);

	readonly Heatmaps = storageSignal<Record<Heatmap, boolean>>(
		Setting.EnabledHeatmaps,
		{
			[Heatmap.Averages]: true,
			[Heatmap.Series]: true,
			[Heatmap.Totals]: true,
		},
	);

	readonly HighDensityTable = storageSignal<boolean>(
		Setting.EnableHighDensityTable,
		false,
	);

	readonly OfferTypes = storageSignal<Record<OfferType, boolean>>(
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

	readonly Series = storageSignal<Record<Series, boolean>>(
		Setting.ShowSeries,
		{
			[Series.CIG]: false,
			[Series.GCA]: false,
			[Series.TemperatureHigh]: false,
			[Series.TemperatureLow]: true,
			[Series.Usage]: true,
		},
	);

	readonly StripedTable = storageSignal<boolean>(
		Setting.EnableStripedTable,
		true,
	);

	readonly tableColumnCount = computed(() => {
		let columnCount = 0;

		const columns = this.Columns();

		if (columns[ExplorerColumn.Name]) columnCount++;
		if (columns[ExplorerColumn.CommmodityCharge]) columnCount++;
		if (columns[ExplorerColumn.Term]) columnCount++;
		if (columns[ExplorerColumn.ConfirmationCode]) columnCount++;
		if (columns[ExplorerColumn.Average]) columnCount++;
		if (columns[ExplorerColumn.Month]) columnCount += 12;

		return columnCount;
	});

	resetRefiners() {
		this.Series.set({
			[Series.CIG]: false,
			[Series.GCA]: false,
			[Series.TemperatureHigh]: false,
			[Series.TemperatureLow]: false,
			[Series.Usage]: true,
		});
		this.OfferTypes.set({
			best: true,
			blended: true,
			custom: true,
			fpm: true,
			fpt: true,
			market: true,
		});
		this.Columns.set({
			[ExplorerColumn.Average]: true,
			[ExplorerColumn.CommmodityCharge]: true,
			[ExplorerColumn.ConfirmationCode]: true,
			[ExplorerColumn.Month]: true,
			[ExplorerColumn.Name]: true,
			[ExplorerColumn.Term]: true,
		});
		this.Heatmaps.set({
			[Heatmap.Averages]: true,
			[Heatmap.Series]: true,
			[Heatmap.Totals]: true,
		});
	}

	setColumn(column: ExplorerColumn, enabled: boolean) {
		this.Columns.set({
			...this.Columns(),
			[column]: enabled,
		});
	}

	setHeatmap(heatmap: Heatmap, enabled: boolean) {
		this.Heatmaps.set({
			...this.Heatmaps(),
			[heatmap]: enabled,
		});
	}

	setOfferType(offerType: OfferType, enabled: boolean) {
		this.OfferTypes.set({
			...this.OfferTypes(),
			[offerType]: enabled,
		});
	}

	setSeries(series: Series, enabled: boolean) {
		this.Series.set({
			...this.Series(),
			[series]: enabled,
		});
	}
}
