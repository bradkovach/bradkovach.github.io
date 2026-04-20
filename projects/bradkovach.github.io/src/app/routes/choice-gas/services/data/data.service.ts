import type { Offer } from '../../entity/Offer';
import type { Charge } from '../../entity/Charge';
import type {
	Series} from '../../data/data.default';
import type { FixedArray } from '../../entity/FixedArray';

import { computed, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { z } from 'zod';

import { vendors } from '../../data/vendors';
import { ChargeType } from '../../entity/ChargeType';
import { Setting } from '../../data/enum/settings.enum';
import { storageSignal } from '../../pages/explorer/localStorageSignal';
import {
	defaultCharges,
	seriesDefaults,
	SeriesKeys,
} from '../../data/data.default';

const ChargeSchema = z.object({
	name: z.string(),
	rate: z.number(),
	type: z.nativeEnum(ChargeType),
});

const ChargesSchema = z.array(ChargeSchema);

const OverridesSchema = z.record(z.number());

const SeriesSchema = z.record(z.array(z.number()).length(12));

const UsageSchema = z.array(z.number());

export enum EnrollmentField {
	AccountNumber,
	ControlNumber,
	Notes,
}

const enrollmentFieldLabel: Record<EnrollmentField, string> = {
	[EnrollmentField.AccountNumber]: 'Account Number',
	[EnrollmentField.ControlNumber]: 'Control Number',
	[EnrollmentField.Notes]: 'Notes',
};

const enrollmentFieldDefaults: Record<EnrollmentField, string> = {
	[EnrollmentField.AccountNumber]: '',
	[EnrollmentField.ControlNumber]: '',
	[EnrollmentField.Notes]: '',
};

@Injectable({
	providedIn: 'root',
})
export class DataService {
	private chargesSignal = storageSignal<Charge[]>(
		Setting.Charges,
		defaultCharges,
		JSON.stringify,
		(str) => ChargesSchema.parse(JSON.parse(str)),
	);

	charges$ = toObservable(this.chargesSignal);

	private enrollmentFieldSignal = storageSignal<
		Record<EnrollmentField, string>
	>(
		Setting.EnrollmentFields,
		enrollmentFieldDefaults,
		JSON.stringify,
		(str) =>
			z.record(z.string()).parse(JSON.parse(str)) as Record<
				EnrollmentField,
				string
			>,
	);

	enrollmentFields = this.enrollmentFieldSignal.asReadonly();

	private rateOverridesSignal = storageSignal<Record<string, number>>(
		Setting.OfferRateOverrides,
		{},
		JSON.stringify,
		(str) => OverridesSchema.parse(JSON.parse(str)),
	);

	rateOverrides$ = toObservable(this.rateOverridesSignal);

	private seriesOverridesSignal = storageSignal<
		Record<string, FixedArray<number, 12>>
	>(
		Setting.SeriesOverrides,
		{},
		JSON.stringify,
		(str) =>
			SeriesSchema.parse(JSON.parse(str)) as Record<
				string,
				FixedArray<number, 12>
			>,
	);

	series = computed(() => {
		return Object.assign({}, seriesDefaults, this.seriesOverridesSignal());
	});

	series$ = toObservable(this.series);
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
	vendors$ = toObservable(this.vendorsSignal);
	resetSettings() {
		this.seriesOverridesSignal.set({});
		this.rateOverridesSignal.set({});
		this.chargesSignal.set(defaultCharges);
	}

	setCharges(charges: Charge[]) {
		this.chargesSignal.set(charges);
	}

	setEnrollmentField(field: EnrollmentField, value: string) {
		this.enrollmentFieldSignal.update((current) => ({
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
