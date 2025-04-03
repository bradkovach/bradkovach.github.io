import type {
	BestOffer,
	BlendedOffer,
	FixedPerMonthOffer,
	FixedPerThermOffer,
	MarketOffer,
	OfferBase,
} from '../../entity/Offer';

import {
	AsyncPipe,
	DecimalPipe,
	JsonPipe,
	NgTemplateOutlet,
} from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { combineLatest, map } from 'rxjs';

import z from 'zod';

import { DataService } from '../../services/data/data.service';

import { Market } from '../../data/Market';
import { OfferSchema } from '../../entity/Offer';

const VendorSchema = z.object({
	id: z.string().min(2),
	name: z.string().min(2),
	offers: z.array(OfferSchema),
	phone: z.string(),
});

@Component({
	imports: [AsyncPipe, JsonPipe, NgTemplateOutlet, DecimalPipe, FormsModule],
	selector: 'app-cg-import',
	styleUrl: './import.component.scss',
	templateUrl: './import.component.html',
})
export class ImportComponent {
	private route = inject(ActivatedRoute);
	offers$ = this.route.queryParamMap.pipe(
		map((p) => {
			const offers = p.getAll('offer');
			if (!offers) return [];

			return offers.map((offer) => {
				return {
					import: true,
					offer: OfferSchema.parse(JSON.parse(offer)),
				};
			});
		}),
	);

	vendors$ = this.route.queryParamMap.pipe(
		map((p) => {
			const vendor = p.getAll('vendor');
			if (!vendor) return [];

			return vendor.map((vendor) => {
				return {
					import: true,
					vendor: VendorSchema.parse(JSON.parse(vendor)),
				};
			});
		}),
	);

	private dataService = inject(DataService);

	vm$ = combineLatest({
		charges: this.dataService.charges$,
		series: this.dataService.series$,
	});

	private readonly title = inject(Title);

	constructor() {
		this.title.setTitle('Choice Gas - Import Data');
		const query = new URLSearchParams();
		const fpmOffer: FixedPerMonthOffer & OfferBase = {
			id: '185',
			name: 'FPM @ $90 x 2 years',
			rate: 90,
			term: 2,
			type: 'fpm',
		};
		query.append('offer', JSON.stringify(fpmOffer));

		const fptOffer: FixedPerThermOffer & OfferBase = {
			id: '186',
			name: 'FPT @ $0.25',
			rate: 0.25,
			term: 1,
			type: 'fpt',
			vendor_id: 'com.choicegas',
		};
		query.append('offer', JSON.stringify(fptOffer));

		const indexOffer: MarketOffer & OfferBase = {
			id: '187',
			market: Market.CIG,
			name: 'Index @ $0.25',
			rate: 0.25,
			term: 1,
			type: 'market',
		};
		query.append('offer', JSON.stringify(indexOffer));

		const gcaOffer: MarketOffer & OfferBase = {
			id: '188',
			market: Market.GCA,
			name: 'GCA @ $0.25',
			rate: 0.25,
			term: 1,
			type: 'market',
		};
		query.append('offer', JSON.stringify(gcaOffer));

		const blendedOffer: BlendedOffer & OfferBase = {
			id: '189',
			name: 'Blended',
			offers: [
				[0.25, fptOffer],
				[0.25, indexOffer],
				[0.25, gcaOffer],
			],
			term: 1,
			type: 'blended',
		};
		query.append('offer', JSON.stringify(blendedOffer));

		const bestOffer: BestOffer & OfferBase = {
			id: '190',
			name: 'Best',
			offers: [fptOffer, fpmOffer, indexOffer, gcaOffer],
			term: 1,
			type: 'best',
		};
		query.append('offer', JSON.stringify(bestOffer));
	}
}
