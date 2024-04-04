import { Injectable } from '@angular/core';
import { ReplaySubject, combineLatest, map } from 'rxjs';
import { Market } from '../../data/data.current';
import {
  defaultCharges,
  defaultRates,
  defaultUsage,
} from '../../data/data.default';
import { vendors } from '../../data/vendors';
import { Charge } from '../../entity/Charge';
import { FixedArray } from '../../entity/FixedArray';
import { Offer } from '../../entity/Offer';
import { Vendor } from '../../entity/Vendor';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {
    console.log('Initializing data service');
    this.setUsage(
      window && window.localStorage && localStorage.getItem('usage') !== null
        ? (JSON.parse(localStorage.getItem('usage')!) as FixedArray<number, 12>)
        : defaultUsage,
    );

    this.setCharges(
      window && window.localStorage && localStorage.getItem('charges') !== null
        ? (JSON.parse(localStorage.getItem('charges')!) as Charge[])
        : defaultCharges,
    );

    this.setRates(
      window && window.localStorage && localStorage.getItem('rates') !== null
        ? (JSON.parse(localStorage.getItem('rates')!) as Record<
            Market,
            FixedArray<number, 12>
          >)
        : defaultRates,
    );

    this.setVendors(vendors);

    this.setRateOverrides(
      window &&
        window.localStorage &&
        localStorage.getItem('rateOverrides') !== null
        ? (JSON.parse(localStorage.getItem('rateOverrides')!) as Record<
            string,
            number
          >)
        : {},
    );
  }

  private usageSubject = new ReplaySubject<FixedArray<number, 12>>(1);

  usage$ = this.usageSubject.asObservable();

  setUsage(value: FixedArray<number, 12>) {
    localStorage.setItem('usage', JSON.stringify(value));
    this.usageSubject.next(value);
  }

  private chargesSubject = new ReplaySubject<Charge[]>(1);

  charges$ = this.chargesSubject.asObservable();

  setCharges(charges: Charge[]) {
    localStorage.setItem('charges', JSON.stringify(charges));
    this.chargesSubject.next(charges);
  }

  private ratesSubject = new ReplaySubject<
    Record<Market, FixedArray<number, 12>>
  >(1);

  rates$ = this.ratesSubject.asObservable();

  setRates(rates: Record<Market, FixedArray<number, 12>>) {
    localStorage.setItem('rates', JSON.stringify(rates));
    this.ratesSubject.next(rates);
  }

  private rateOverridesSubject = new ReplaySubject<Record<string, number>>(1);

  rateOverrides$ = this.rateOverridesSubject.asObservable().pipe(
    map((overrides) => {
      let str = localStorage.getItem('rateOverrides');
      const existing = str ? JSON.parse(str) : {};
      const merged = { ...existing, ...overrides };
      localStorage.setItem('rateOverrides', JSON.stringify(merged));
      return merged;
    }),
  );

  setRateOverrides(rateOverrides: Record<string, number>) {
    this.rateOverridesSubject.next(rateOverrides);
  }

  private vendorsSubject = new ReplaySubject<Vendor[]>(1);

  vendors$ = combineLatest({
    vendors: this.vendorsSubject.asObservable(),
    overrides: this.rateOverrides$,
  }).pipe(
    map(({ vendors, overrides }) => {
      return vendors.map((vendor) => {
        const newVendor = { ...vendor };
        newVendor.offers = new Map(
          [...vendor.offers.entries()].map(([id, offer]) => {
            const newOffer = { ...offer } as Offer;
            if (newOffer.type === 'fpm') {
              const key = `@${vendor.id}/${offer.id}`;
              if (overrides[key]) {
                newOffer.rate = overrides[key];
              }
            }
            return [id, newOffer];
          }),
        );
        return newVendor;
      });
    }),
  );

  setVendors(vendors: Vendor[]) {
    this.vendorsSubject.next(vendors);
  }
}
