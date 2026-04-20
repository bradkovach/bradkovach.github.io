import type { Month } from '../../data/enum/month.enum';
import type { Offer } from '../../entity/Offer';
import type { Vendor } from '../../entity/Vendor';

import { AsyncPipe, DecimalPipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { combineLatest, filter, map, tap } from 'rxjs';

import { DataService } from '../../services/data/data.service';

import { BillComponent } from '../../components/bill/bill.component';

import { marketLabels } from '../../data/data.current';
import { Series } from '../../data/data.default';
import {
	HeatmapScheme,
	heatmapSchemePalettes,
} from '../../data/enum/heatmap.enum';
import { monthLabels } from '../../data/enum/month.enum';
import { Setting } from '../../data/enum/settings.enum';
import { createBill } from '../../pipes/bill/bill.pipe';
import { HeatPipe } from '../../pipes/heat/heat.pipe';
import { PhonePipe } from '../../pipes/phone/phone.pipe';
import { storageSignal } from '../explorer/localStorageSignal';

@Component({
	imports: [
		AsyncPipe,
		BillComponent,
		DecimalPipe,
		FormsModule,
		HeatPipe,
		PhonePipe,
		JsonPipe,
	],
	selector: 'app-offer',
	styleUrl: './offer.component.scss',
	templateUrl: './offer.component.html',
})
export class OfferComponent {
	readonly dataService = inject(DataService);
	dpts = signal<number[]>([]);
	readonly MonthKeys = Object.keys(monthLabels) as unknown as Month[];
	offerId = input.required<string>({});

	vendorId = input.required<string>();
	vendor$ = this.dataService.vendors$.pipe(
		map((vendors) =>
			vendors.find((vendor) => vendor.id === this.vendorId()),
		),
	);

	offer$ = this.vendor$.pipe(
		filter((vendor): vendor is Vendor => !!vendor),
		map((vendor) => vendor.offers.get(this.offerId())!),
	);

	// scheme =

	therms = signal<number[]>([]);

	totals = signal<number[]>([]);

	tpds = signal<number[]>([]);

	bills$ = combineLatest({
		charges: this.dataService.charges$,
		offer: this.offer$,
		series: this.dataService.series$,
	}).pipe(
		map(({ charges, offer, series }) =>
			this.MonthKeys.map((month) =>
				createBill(offer, month, series[Series.Usage], charges, series),
			),
		),
		tap((bills) => {
			this.therms.set(
				bills.map((bill) => bill.therms).sort((a, b) => a - b),
			);
			this.totals.set(
				bills.map((bill) => bill.total).sort((a, b) => a - b),
			);
			this.dpts.set(bills.map((bill) => bill.dollarsPerTherm).sort());
			this.tpds.set(
				bills.map((bill) => bill.thermsPerDollar).sort((a, b) => b - a),
			);
		}),
	);

	data$ = combineLatest({
		charges: this.dataService.charges$,
		series: this.dataService.series$.pipe(),
	});

	readonly MarketLabels = marketLabels;
	readonly MonthLabels = monthLabels;
	palette = computed(() => {
		return heatmapSchemePalettes[this.scheme()];
	});
	readonly router = inject(Router);

	scheme = storageSignal(Setting.Scheme, HeatmapScheme.GreenYellowRed);

	readonly Series = Series;
	readonly title = inject(Title);

	constructor() {
		combineLatest({
			offer: this.offer$,
			vendor: this.vendor$,
		})
			.pipe(
				map(({ offer, vendor }) =>
					[
						'Choice Gas',
						vendor?.name ?? 'Vendor',
						offer?.name ?? 'Offer',
					].join(' - '),
				),
			)
			.subscribe((title) => this.title.setTitle(title));
	}

	copy(text: string) {
		void navigator.clipboard.writeText(text).then(() => {
			alert('Copied to clipboard!');
		});
	}

	getShareLink(
		vendor: null | undefined | Vendor,
		offer: null | Offer | undefined,
	) {
		return (
			'https://bradkovach.github.io' +
			this.router.serializeUrl(
				this.router.createUrlTree(['/choice-gas/import'], {
					queryParams: {
						offer: JSON.stringify(offer),
						vendor: JSON.stringify(vendor),
					},
					relativeTo: this.router.routerState.root,
				}),
			)
		);
	}

	setOverride(
		vendor: null | undefined | Vendor,
		offer: null | Offer | undefined,
		value: string,
	) {
		if (!vendor) {
			return;
		}
		if (!offer) {
			return;
		}

		this.dataService.setRateOverrides({
			[`@${vendor.id}/${offer.id}`]: Number(value),
		});
	}
}
