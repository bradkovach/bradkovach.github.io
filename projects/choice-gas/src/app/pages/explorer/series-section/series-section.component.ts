import { DecimalPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
} from '@angular/core';

import { Series, SeriesLabels } from '../../../data/data.default';
import { monthLabels, monthLabelsAbbr } from '../../../data/enum/month.enum';
import { HeatDirective } from '../../../directives/heat/heat.directive';
import { AveragePipe } from '../../../pipes/average/average.pipe';
import { HeatmapManager } from '../../../services/heatmap-manager/heatmap-manager.service';
import { ExplorerColumn, explorerColumnLabels } from '../ExplorerColumn';
import { extractKeys } from '../extractKeys';
import { PreferencesService } from '../preferences.service';

@Component({
	imports: [DecimalPipe, HeatDirective, AveragePipe],
	selector: 'tr[seriesRow]',
	template: `
		@if (enabledColumns().has(ExplorerColumn.Name)) {
			<th scope="row">
				{{ label() }}
			</th>
		}
		@if (enabledColumns().has(ExplorerColumn.CommmodityCharge)) {
			<td>&nbsp;</td>
		}
		@if (enabledColumns().has(ExplorerColumn.Term)) {
			<td>&nbsp;</td>
		}
		@if (enabledColumns().has(ExplorerColumn.ConfirmationCode)) {
			<td>&nbsp;</td>
		}
		@if (enabledColumns().has(ExplorerColumn.Average)) {
			<td class="text-end">
				{{ data() | average | number: '1.0-0' }}
			</td>
		}
		@if (enabledColumns().has(ExplorerColumn.Month)) {
			@for (month of Months; track month) {
				@let value = data()[month];
				<td
					scope="col"
					class="text-end"
					[heat]="true"
					[value]="value"
					[values]="data()"
					[scale]="scale()">
					{{ value | number: '1.0-2' }}
				</td>
			}
		}
	`,
})
export class SeriesRowComponent {
	readonly data = input.required<number[]>();

	readonly direction = input.required<-1 | 1>();
	readonly #preferences = inject(PreferencesService);
	readonly enabledColumns = this.#preferences.enabledColumns;
	readonly ExplorerColumn = ExplorerColumn;
	readonly label = input.required<string>();

	readonly monthLabelsAbbr = monthLabelsAbbr;
	readonly Months = extractKeys(monthLabels);

	readonly #heatmapManager = inject(HeatmapManager);
	readonly scale = this.#heatmapManager.scaleFor(this.data);
	readonly series = input.required<Series>();

	// readonly SeriesLabels = SeriesLabels;
}

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [SeriesRowComponent],
	selector: 'thead[seriesSection]',
	template: `
		@let ExplorerColumn = Enums.ExplorerColumn;

		@let ExplorerColumnLabels = Strings.explorerColumnLabels;
		@let monthLabelsAbbr = Strings.monthLabelsAbbr;

		@let Months = EnumArrays.Months;
		@let SeriesKeys = EnumArrays.SeriesKeys;

		@for (series of SeriesKeys; track series) {
			@if (preferences.Series()[series]) {
				<tr
					seriesRow
					[series]="series"
					[label]="SeriesLabels[series]"
					[data]="seriesValues()[series]"
					[direction]="SeriesDirections[series]"></tr>
			}
		}

		<tr>
			@if (preferences.enabledColumns().has(ExplorerColumn.Name)) {
				<th>{{ ExplorerColumnLabels[ExplorerColumn.Name] }}</th>
			}
			@if (preferences.enabledColumns().has(ExplorerColumn.CommmodityCharge)) {
				<th>
					{{ ExplorerColumnLabels[ExplorerColumn.CommmodityCharge] }}
				</th>
			}
			@if (preferences.enabledColumns().has(ExplorerColumn.Term)) {
				<th>{{ ExplorerColumnLabels[ExplorerColumn.Term] }}</th>
			}
			@if (preferences.enabledColumns().has(ExplorerColumn.ConfirmationCode)) {
				<th class="text-center">
					{{ ExplorerColumnLabels[ExplorerColumn.ConfirmationCode] }}
				</th>
			}
			@if (preferences.enabledColumns().has(ExplorerColumn.Average)) {
				<th class="text-end">
					{{ ExplorerColumnLabels[ExplorerColumn.Average] }}
				</th>
			}
			@if (preferences.enabledColumns().has(ExplorerColumn.Month)) {
				@for (month of Months; track month) {
					<th scope="col" class="text-end">
						{{ monthLabelsAbbr[month] }}
					</th>
				}
			}
		</tr>
	`,
})
export class SeriesSectionComponent {
	readonly preferences = inject(PreferencesService);

	readonly EnumArrays = {
		Months: extractKeys(monthLabels),
		SeriesKeys: extractKeys(SeriesLabels),
	};

	readonly Enums = {
		ExplorerColumn,
	};

	// readonly palette = input.required<string[]>();

	readonly #heatmapManager = inject(HeatmapManager);

	readonly palette = this.#heatmapManager.palette;

	readonly seriesValues = input.required<Record<Series, number[]>>();

	readonly seriesAverages = computed(() => {
		const values = this.seriesValues();

		return this.EnumArrays.SeriesKeys.reduce<Record<Series, number>>(
			(averages, series) => {
				const seriesValues = values[series];
				averages[series] =
					seriesValues.reduce((sum, value) => sum + value, 0) /
					seriesValues.length;
				return averages;
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

	readonly SeriesLabels = SeriesLabels;

	readonly Strings = {
		explorerColumnLabels,
		monthLabelsAbbr,
	};
}
