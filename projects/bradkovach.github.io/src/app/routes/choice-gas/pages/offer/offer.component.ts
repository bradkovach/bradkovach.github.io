import { AsyncPipe, DecimalPipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, filter, map, tap } from 'rxjs';
import { BillComponent } from '../../components/bill/bill.component';
import { marketLabels } from '../../data/data.current';

import { Offer } from '../../entity/Offer';
import { Vendor } from '../../entity/Vendor';

import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Series } from '../../data/data.default';
import {
	HeatmapScheme,
	heatmapSchemePalettes,
} from '../../data/enum/heatmap.enum';
import { Month, monthLabels } from '../../data/enum/month.enum';
import { Setting } from '../../data/enum/settings.enum';
import { BillPipe, createBill } from '../../pipes/bill/bill.pipe';
import { HeatPipe } from '../../pipes/heat/heat.pipe';
import { PhonePipe } from '../../pipes/phone/phone.pipe';
import { SortPipe } from '../../pipes/sort/sort.pipe';
import { DataService } from '../../services/data/data.service';
import { storageSignal } from '../explorer/localStorageSignal';

@Component({
    selector: 'app-offer',
    imports: [
        AsyncPipe,
        JsonPipe,
        PhonePipe,
        DecimalPipe,
        BillComponent,
        BillPipe,
        FormsModule,
        HeatPipe,
        SortPipe,
    ],
    templateUrl: './offer.component.html',
    styleUrl: './offer.component.scss'
})
export class OfferComponent {
	readonly MonthKeys = Object.keys(monthLabels) as unknown as Month[];
	readonly MonthLabels = monthLabels;
	readonly MarketLabels = marketLabels;
	readonly Series = Series;

	vendorId = input.required<string>();
	offerId = input.required<string>();

	readonly dataService = inject(DataService);

	// scheme =

	scheme = storageSignal(Setting.Scheme, HeatmapScheme.GreenYellowRed);

	palette = computed(() => {
		return heatmapSchemePalettes[this.scheme()];
	});

	data$ = combineLatest({
		charges: this.dataService.charges$,
		series: this.dataService.series$.pipe(),
	});

	vendor$ = this.dataService.vendors$.pipe(
		map((vendors) =>
			vendors.find((vendor) => vendor.id === this.vendorId()),
		),
	);

	offer$ = this.vendor$.pipe(
		filter((vendor): vendor is Vendor => !!vendor),
		map((vendor) => vendor!.offers.get(this.offerId())!),
	);

	therms = signal<number[]>([]);
	totals = signal<number[]>([]);
	dpts = signal<number[]>([]);
	tpds = signal<number[]>([]);

	bills$ = combineLatest({
		charges: this.dataService.charges$,
		series: this.dataService.series$,
		offer: this.offer$,
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

	constructor(title: Title) {
		combineLatest({
			vendor: this.vendor$,
			offer: this.offer$,
		}).subscribe(({ vendor, offer }) => {
			if (vendor && offer) {
				title.setTitle(`Choice Gas - ${vendor.name} - ${offer.name}`);
			}
		});
	}

	readonly router = inject(Router);

	getShareLink(
		vendor: Vendor | undefined | null,
		offer: Offer | undefined | null,
	) {
		return (
			'https://bradkovach.github.io' +
			this.router.serializeUrl(
				this.router.createUrlTree(['/choice-gas/import'], {
					queryParams: {
						vendor: JSON.stringify(vendor),
						offer: JSON.stringify(offer),
					},
					relativeTo: this.router.routerState.root,
				}),
			)
		);
	}

	copy(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			alert('Copied to clipboard!');
		});
	}

	setOverride(
		vendor: Vendor | undefined | null,
		offer: Offer | undefined | null,
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
