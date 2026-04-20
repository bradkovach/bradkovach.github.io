import type { Month } from '../../data/enum/month.enum';
import type { Market } from '../../data/Market';
import type { Charge } from '../../entity/Charge';
import type { FixedArray } from '../../entity/FixedArray';

import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { combineLatest, map, take, tap } from 'rxjs';

import { DataService } from '../../services/data/data.service';

import { marketLabels } from '../../data/data.current';
import {
	defaultCharges,
	Series,
	seriesDefaults,
	SeriesKeys,
	SeriesLabels,
} from '../../data/data.default';
import { monthLabels } from '../../data/enum/month.enum';
import { ChargeType } from '../../entity/ChargeType';

@Component({
	imports: [FormsModule, AsyncPipe, RouterLink],
	selector: 'app-data-editor',
	styleUrl: './data-editor.component.scss',
	templateUrl: './data-editor.component.html',
})
export class DataEditorComponent {
	readonly ChargeType = ChargeType;

	readonly locks = signal<Record<Series, boolean>>({
		[Series.CIG]: true,
		[Series.GCA]: true,
		[Series.TemperatureHigh]: false,
		[Series.TemperatureLow]: false,
		[Series.Usage]: false,
	});
	readonly MarketKeys = Object.keys(marketLabels) as unknown as Market[];
	readonly MarketLabels = marketLabels;
	readonly MonthKeys = Object.keys(monthLabels) as unknown as Month[];
	readonly MonthLabels = monthLabels;

	readonly SeriesKeys = SeriesKeys;
	readonly SeriesLabels = SeriesLabels;

	readonly steps: Record<Series, number> = {
		[Series.CIG]: 0.01,
		[Series.GCA]: 0.01,
		[Series.TemperatureHigh]: 1,
		[Series.TemperatureLow]: 1,
		[Series.Usage]: 1,
	};

	private dataService = inject(DataService);

	vm$ = combineLatest({
		charges: this.dataService.charges$,
		locksEffect: this.dataService.series$.pipe(
			take(1),
			tap((values) => {
				const locks = {} as Record<Series, boolean>;
				for (const seriesKey of SeriesKeys) {
					this.locks.update((current) => {
						locks[seriesKey] = values[seriesKey].every(
							(value, i, arr) => value === arr[0],
						);
						return locks;
					});
				}
			}),
		),
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
	});

	private readonly title = inject(Title);

	constructor() {
		this.title.setTitle('Choice Gas - Data Editor');
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

	resetCharges() {
		this.dataService.setCharges(defaultCharges);
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
				this.resetSeries(key);
			});
		}
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

	setSeries(
		value: number | string,
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

	sortCharges(charges: Charge[]) {
		const newCharges = [...charges] as Charge[];
		newCharges.sort((a, b) => a.type - b.type);
		this.dataService.setCharges(newCharges);
	}
}
