import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { combineLatest, map, take, tap } from 'rxjs';

import { Title } from '@angular/platform-browser';
import { Market, marketLabels } from '../../data/data.current';
import {
	Series,
	SeriesKeys,
	SeriesLabels,
	defaultCharges,
	seriesDefaults,
} from '../../data/data.default';
import { Month, monthLabels } from '../../data/enum/month.enum';
import { Charge } from '../../entity/Charge';
import { ChargeType } from '../../entity/ChargeType';
import { FixedArray } from '../../entity/FixedArray';
import { DataService } from '../../services/data/data.service';

@Component({
    selector: 'app-data-editor',
    imports: [FormsModule, AsyncPipe, RouterLink],
    templateUrl: './data-editor.component.html',
    styleUrl: './data-editor.component.scss'
})
export class DataEditorComponent {
	private dataService = inject(DataService);

	readonly ChargeType = ChargeType;
	readonly MonthKeys = Object.keys(monthLabels) as unknown as Month[];
	readonly MonthLabels = monthLabels;
	readonly MarketKeys = Object.keys(marketLabels) as unknown as Market[];
	readonly MarketLabels = marketLabels;

	readonly SeriesKeys = SeriesKeys;
	readonly SeriesLabels = SeriesLabels;

	readonly locks = signal<Record<Series, boolean>>({
		[Series.CIG]: true,
		[Series.GCA]: true,
		[Series.Usage]: false,
		[Series.TemperatureHigh]: false,
		[Series.TemperatureLow]: false,
	});

	readonly steps: Record<Series, number> = {
		[Series.CIG]: 0.01,
		[Series.GCA]: 0.01,
		[Series.Usage]: 1,
		[Series.TemperatureHigh]: 1,
		[Series.TemperatureLow]: 1,
	};

	vm$ = combineLatest({
		charges: this.dataService.charges$,
		series: this.dataService.series$,
		vendors: this.dataService.vendors$.pipe(
			// only vendors that have offers with type === 'fpm'
			map((vendors) =>
				vendors.filter((vendor) =>
					[...vendor.offers].some(
						([offerId, offer]) => offer.type === 'fpm',
					),
				),
			),
		),
		locksEffect: this.dataService.series$.pipe(
			take(1),
			tap((values) => {
				const locks = {} as Record<Series, boolean>;
				for (const seriesKey of SeriesKeys) {
					values[seriesKey].every(
						(value, i, arr) => value === arr[0],
					) &&
						this.locks.update((current) => {
							locks[seriesKey] = true;
							return locks;
						});
				}
			}),
		),
	});

	constructor(title: Title) {
		title.setTitle('Choice Gas - Data Editor');
	}

	addCharge(charges: Charge[]) {
		const update = [...charges];
		update.push({ name: '', rate: 0, type: ChargeType.PerTherm });
		this.dataService.setCharges(update);
	}

	removeCharge(index: number, charges: Charge[]) {
		const newCharges = [...charges] as Charge[];
		newCharges.splice(index, 1);
		this.dataService.setCharges(newCharges);
	}

	setCharge(
		partialCharge: Partial<Charge>,
		index: number,
		charges: Charge[],
	) {
		const oldCharge = charges[index];
		const newCharges = [...charges] as Charge[];
		newCharges[index] = { ...oldCharge, ...partialCharge };

		const type = newCharges[index].type;
		if (typeof type === 'string' && type in ChargeType) {
			newCharges[index].type = ChargeType[type] as unknown as ChargeType;
		}

		this.dataService.setCharges(newCharges);
	}

	resetCharges() {
		this.dataService.setCharges(defaultCharges);
	}

	sortCharges(charges: Charge[]) {
		const newCharges = [...charges] as Charge[];
		newCharges.sort((a, b) => a.type - b.type);
		this.dataService.setCharges(newCharges);
	}

	setSeries(
		value: string | number,
		key: Series,
		rateIdx: number,
		allSeries: Record<Series, FixedArray<number, 12>>,
		lock: boolean,
	): void {
		const currentSeries = [...allSeries[key]];

		currentSeries[rateIdx] = Number(value);
		this.dataService.setSeries({
			[key]: lock ? Array(12).fill(Number(value)) : currentSeries,
		});
	}

	resetSeries(series?: Series) {
		if (series !== undefined) {
			this.dataService.setSeries({
				[series]: seriesDefaults[series],
			});
			this.locks.update((current) => ({
				...current,
				[series]: seriesDefaults[series].every(
					(value, i, arr) => value === arr[0],
				),
			}));
		} else {
			SeriesKeys.forEach((key) => {
				this.resetSeries(key as Series);
			});
		}
	}

	setLock(locked: boolean, value: number, series: Series) {
		if (locked) {
			this.dataService.setSeries({
				[series]: Array(12).fill(value),
			});
		}
		this.locks.update((current) => ({
			...current,
			[series]: locked,
		}));
	}

	setRateOverride(vendorId: string, offerId: string, rate: number) {
		this.dataService.setRateOverrides({
			[`@${vendorId}/${offerId}`]: rate,
		});
	}
}
