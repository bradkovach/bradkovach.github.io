import { computed, Injectable, type Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { storageSignal } from 'ngx-oneforall/signals/storage-signal';
import { z } from 'zod';

import type { Series } from '../../data/data.default';
import type { Charge } from '../../entity/Charge';
import type { FixedArray } from '../../entity/FixedArray';
import type { Vendor } from '../../entity/Vendor';
import type { AnyOffer } from '../../schema/offer.z';

import {
	defaultCharges,
	seriesDefaults,
	SeriesKeys,
} from '../../data/data.default';
import { Setting } from '../../data/enum/settings.enum';
import { vendors } from '../../data/vendors';
import { ChargeType } from '../../entity/ChargeType';

const ChargeSchema = z.object({
	name: z.string(),
	rate: z.number(),
	type: z.nativeEnum(ChargeType),
});

const ChargesSchema = z.array(ChargeSchema);

const OverridesSchema = z.record(z.number());

const SeriesSchema = z.record(z.array(z.number()).length(12));

// const UsageSchema = z.array(z.number());

export enum EnrollmentField {
	AccountNumber,
	ControlNumber,
	Notes,
}

// const enrollmentFieldLabel: Record<EnrollmentField, string> = {
// 	[EnrollmentField.AccountNumber]: 'Account Number',
// 	[EnrollmentField.ControlNumber]: 'Control Number',
// 	[EnrollmentField.Notes]: 'Notes',
// };

const enrollmentFieldDefaults: Record<EnrollmentField, string> = {
	[EnrollmentField.AccountNumber]: '',
	[EnrollmentField.ControlNumber]: '',
	[EnrollmentField.Notes]: '',
};

@Injectable({
	providedIn: 'root',
})
export class DataService {
	readonly charges = storageSignal<Charge[]>(
		Setting.Charges,
		defaultCharges,
		{
			crossTabSync: true,
			deserializer: (str) => ChargesSchema.parse(JSON.parse(str)),
			serializer: JSON.stringify,
		},
	);

	readonly charges$ = toObservable(this.charges);

	readonly enrollmentFields = storageSignal<Record<EnrollmentField, string>>(
		Setting.EnrollmentFields,
		enrollmentFieldDefaults,
		{
			crossTabSync: true,
			deserializer: (str) =>
				z.record(z.string()).parse(JSON.parse(str)) as Record<
					EnrollmentField,
					string
				>,
			serializer: JSON.stringify,
		},
	);

	private rateOverridesSignal = storageSignal<Record<string, number>>(
		Setting.OfferRateOverrides,
		{},
		{
			crossTabSync: true,
			deserializer: (str) => OverridesSchema.parse(JSON.parse(str)),
			serializer: JSON.stringify,
		},
	);

	rateOverrides$ = toObservable(this.rateOverridesSignal);

	private seriesOverridesSignal = storageSignal<
		Record<string, FixedArray<number, 12>>
	>(
		Setting.SeriesOverrides,
		{},
		{
			crossTabSync: true,
			deserializer: (str) =>
				SeriesSchema.parse(JSON.parse(str)) as Record<
					string,
					FixedArray<number, 12>
				>,
			serializer: JSON.stringify,
		},
	);

	readonly series = computed(() => {
		return Object.assign({}, seriesDefaults, this.seriesOverridesSignal());
	});

	readonly series$ = toObservable(this.series);
	readonly vendors: Signal<Vendor[]> = computed(() =>
		vendors.map((vendor) => {
			// apply rate overrides for FPM offers
			vendor.offers = new Map(
				[...vendor.offers.entries()].map(([id, offer]) => {
					const newOffer = { ...offer } as AnyOffer;
					if (newOffer.type === 'fpm') {
						const key = `@${vendor.id}/${offer.id}`;
						if (this.rateOverridesSignal()[key]) {
							newOffer.rate = this.rateOverridesSignal()[key];
						}
					}
					return [id, newOffer];
				}),
			);

			return vendor;
		}),
	);

	readonly vendors$ = toObservable(this.vendors);

	resetSettings() {
		this.seriesOverridesSignal.set({});
		this.rateOverridesSignal.set({});
		this.charges.set(defaultCharges);
	}

	setCharges(charges: Charge[]) {
		this.charges.set(charges);
	}

	setEnrollmentField(field: EnrollmentField, value: string) {
		this.enrollmentFields.update((current) => ({
			...current,
			[field]: value,
		}));
	}

	setRateOverrides(rateOverrides: Record<string, number>) {
		this.rateOverridesSignal.update((current) => ({
			...current,
			...rateOverrides,
		}));
	}

	setSeries(
		seriesOverrides: Partial<Record<Series, FixedArray<number, 12>>>,
	) {
		this.seriesOverridesSignal.update((current) => {
			const merged: Record<Series, FixedArray<number, 12>> = {
				...seriesDefaults,
				...current,
				...seriesOverrides,
			};
			// only what isn't default
			SeriesKeys.forEach((key) => {
				if (
					merged[key]?.every(
						(value, i) => value === seriesDefaults[key][i],
					)
				) {
					delete merged[key];
				}
			});

			return merged;
		});
	}
}
