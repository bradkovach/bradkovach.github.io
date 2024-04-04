import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Market } from '../../data/data.current';
import {
  defaultCharges,
  defaultRates,
  defaultUsage,
} from '../../data/data.default';
import { Charge } from '../../entity/Charge';
import { FixedArray } from '../../entity/FixedArray';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {
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
}
