import { Injectable, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { z } from 'zod';
import {
	Series,
	SeriesKeys,
	defaultCharges,
	seriesDefaults,
} from '../../data/data.default';
import { Setting } from '../../data/enum/settings.enum';
import { vendors } from '../../data/vendors';
import { Charge } from '../../entity/Charge';
import { ChargeType } from '../../entity/ChargeType';
import { FixedArray } from '../../entity/FixedArray';
import { Offer } from '../../entity/Offer';
import { storageSignal } from '../../pages/explorer/localStorageSignal';

const ChargeSchema = z.object({
	name: z.string(),
	type: z.nativeEnum(ChargeType),
	rate: z.number(),
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

	private rateOverridesSignal = storageSignal<Record<string, number>>(
		Setting.OfferRateOverrides,
		{},
		JSON.stringify,
		(str) => OverridesSchema.parse(JSON.parse(str)),
	);

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

	setEnrollmentField(field: EnrollmentField, value: string) {
		this.enrollmentFieldSignal.update((current) => ({
			...current,
			[field]: value,
		}));
	}

	series = computed(() => {
		return Object.assign({}, seriesDefaults, this.seriesOverridesSignal());
	});

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
	vendors$ = toObservable(this.vendorsSignal);
	series$ = toObservable(this.series);

	setCharges(charges: Charge[]) {
		this.chargesSignal.set(charges);
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

	resetSettings() {
		this.seriesOverridesSignal.set({});
		this.rateOverridesSignal.set({});
		this.chargesSignal.set(defaultCharges);
	}
}
