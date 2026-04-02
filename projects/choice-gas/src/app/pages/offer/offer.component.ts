import { DecimalPipe, JsonPipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { storageSignal } from 'ngx-oneforall/signals/storage-signal';

import type { Month } from '../../data/enum/month.enum';
import type { Vendor } from '../../entity/Vendor';
import type { AnyOffer } from '../../schema/offer.z';

import { BillComponent } from '../../components/bill/bill.component';
import { marketLabels } from '../../data/data.current';
import { Series } from '../../data/data.default';
import {
	HeatmapScheme,
	heatmapSchemePalettes,
} from '../../data/enum/heatmap.enum';
import { monthLabels } from '../../data/enum/month.enum';
import { Setting } from '../../data/enum/settings.enum';
import { createBill } from '../../helpers/create-bill/create-bill';
import { HeatPipe } from '../../pipes/heat/heat.pipe';
import { PhonePipe } from '../../pipes/phone/phone.pipe';
import { DataService } from '../../services/data/data.service';

@Component({
	imports: [
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
	charges = this.dataService.charges;
	readonly MonthKeys = Object.keys(monthLabels) as unknown as Month[];
	offerId = input.required<string>();

	vendorId = input.required<string>();

	vendors = toSignal(this.dataService.vendors$, { requireSync: true });

	offer = computed(() => {
		const vendor = this.vendors().find(
			(vendor) => vendor.id === this.vendorId(),
		);
		if (!vendor) {
			throw Error('Vendor not found');
		}
		const offer = vendor.offers.get(this.offerId());
		if (!offer) {
			throw Error('Offer not found');
		}
		return offer;
	});

	series = this.dataService.series;

	bills = computed(() => {
		const offer = this.offer();
		const series = this.series();
		const charges = this.charges();
		return this.MonthKeys.map((month) =>
			createBill(offer, month, series[Series.Usage], charges, series),
		);
	});
	dpts = computed(() => {
		return this.bills()
			.map((bill) => bill.dollarsPerTherm)
			.sort((a, b) => a - b);
	});

	readonly Enums = {
		Series,
	};

	readonly Labels = {
		marketLabels,
		monthLabels,
	};

	palette = computed(() => {
		return heatmapSchemePalettes[this.scheme()];
	});

	readonly router = inject(Router);
	// readonly Series = Series;

	scheme = storageSignal(Setting.Scheme, HeatmapScheme.GreenYellowRed);
	therms = computed(() => {
		return this.bills()
			.map((bill) => bill.therms)
			.sort((a, b) => a - b);
	});
	readonly title = inject(Title);

	// totals = signal<number[]>([]);
	totals = computed(() => {
		return this.bills()
			.map((bill) => bill.total)
			.sort((a, b) => a - b);
	});

	tpds = computed(() => {
		return this.bills()
			.map((bill) => bill.thermsPerDollar)
			.sort((a, b) => b - a);
	});
	vendor = computed(() => {
		const v = this.vendors().find(
			(vendor) => vendor.id === this.vendorId(),
		);
		if (!v) {
			throw Error('Vendor not found');
		}
		return v;
	});

	constructor() {
		effect(() => {
			const vendor = this.vendor();
			const offer = this.offer();
			this.title.setTitle(
				`Choice Gas - ${vendor?.name ?? 'Vendor'} - ${
					offer?.name ?? 'Offer'
				}`,
			);
		});
	}

	copy(text: string) {
		void navigator.clipboard.writeText(text).then(() => {
			alert('Copied to clipboard!');
		});
	}

	getShareLink(
		vendor: null | undefined | Vendor,
		offer: AnyOffer | null | undefined,
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
		offer: AnyOffer | null | undefined,
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
