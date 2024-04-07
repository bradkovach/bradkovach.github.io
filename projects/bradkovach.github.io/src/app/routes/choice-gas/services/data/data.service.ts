import { Injectable, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { z } from 'zod';
import { Market } from '../../data/data.current';
import {
	defaultCharges,
	defaultRates,
	defaultUsage,
} from '../../data/data.default';
import { vendors } from '../../data/vendors';
import { Charge } from '../../entity/Charge';
import { ChargeType } from '../../entity/ChargeType';
import { FixedArray } from '../../entity/FixedArray';
import { Offer } from '../../entity/Offer';
import { SettingsKey } from '../../pages/explorer/explorer.component';
import { storageSignal } from '../../pages/explorer/localStorageSignal';

const ChargeSchema = z.object({
	name: z.string(),
	type: z.nativeEnum(ChargeType),
	rate: z.number(),
});

const ChargesSchema = z.array(ChargeSchema);

const OverridesSchema = z.record(z.number());

const RatesSchema = z.record(z.array(z.number()).length(12));

const UsageSchema = z.array(z.number());

@Injectable({
	providedIn: 'root',
})
export class DataService {
	private chargesSignal = storageSignal<Charge[]>(
		SettingsKey.Charges,
		defaultCharges,
		JSON.stringify,
		(str) => ChargesSchema.parse(JSON.parse(str)),
	);

	private rateOverridesSignal = storageSignal<Record<string, number>>(
		SettingsKey.RateOverrides,
		{},
		JSON.stringify,
		(str) => OverridesSchema.parse(JSON.parse(str)),
	);

	private ratesSignal = storageSignal<Record<Market, FixedArray<number, 12>>>(
		SettingsKey.Rates,
		defaultRates,
		JSON.stringify,
		(str) =>
			RatesSchema.parse(JSON.parse(str)) as Record<
				Market,
				FixedArray<number, 12>
			>,
	);

	private usageSignal = storageSignal<FixedArray<number, 12>>(
		SettingsKey.Usage,
		defaultUsage,
		JSON.stringify,
		(str) => UsageSchema.parse(JSON.parse(str)) as FixedArray<number, 12>,
	);

	private vendorsSignal = computed(() =>
		vendors.map((vendor) => {
			const newVendor = { ...vendor };
			newVendor.offers = new Map(
				[...vendor.offers.entries()].map(([id, offer]) => {
					const newOffer = { ...offer } as Offer;
					if (newOffer.type === 'fpm') {
						const key = `@${vendor.id}/${offer.id}`;
						if (this.rateOverridesSignal()[key]) {
							newOffer.rate = this.rateOverridesSignal()[key];
						}
					}
					return [id, newOffer];
				}),
			);
			return newVendor;
		}),
	);

	charges$ = toObservable(this.chargesSignal);
	rateOverrides$ = toObservable(this.rateOverridesSignal);
	rates$ = toObservable(this.ratesSignal);
	usage$ = toObservable(this.usageSignal);
	vendors$ = toObservable(this.vendorsSignal);

	setCharges(charges: Charge[]) {
		this.chargesSignal.set(charges);
	}

	setRateOverrides(rateOverrides: Record<string, number>) {
		this.rateOverridesSignal.set({
			...this.rateOverridesSignal(),
			...rateOverrides,
		});
	}

	setRates(rates: Record<Market, FixedArray<number, 12>>) {
		this.ratesSignal.set(rates);
	}

	setUsage(value: FixedArray<number, 12>) {
		this.usageSignal.set(value);
	}

	resetSettings() {
		this.ratesSignal.set(defaultRates);
		this.usageSignal.set(defaultUsage);
		this.rateOverridesSignal.set({});
		this.chargesSignal.set(defaultCharges);
	}
}
