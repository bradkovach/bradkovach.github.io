import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Market } from '../../data.current';
import { defaultCharges, defaultRates, defaultUsage } from '../../data.default';
import { Charge } from '../../entity/Charge';
import { FixedArray } from '../../entity/FixedArray';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  // _usage: FixedArray<number, 12> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  private usageSubject = new BehaviorSubject<FixedArray<number, 12>>(
    localStorage.getItem('usage') === null
      ? defaultUsage
      : (JSON.parse(localStorage.getItem('usage')!) as FixedArray<number, 12>),
  );

  usage$ = this.usageSubject.asObservable();

  setUsage(value: FixedArray<number, 12>) {
    localStorage.setItem('usage', JSON.stringify(value));
    this.usageSubject.next(value);
  }

  private chargesSubject = new BehaviorSubject<Charge[]>(
    localStorage.getItem('charges') === null
      ? defaultCharges
      : (JSON.parse(localStorage.getItem('charges')!) as Charge[]),
  );

  charges$ = this.chargesSubject.asObservable();

  setCharges(charges: Charge[]) {
    localStorage.setItem('charges', JSON.stringify(charges));
    this.chargesSubject.next(charges);
  }

  private ratesSubject = new BehaviorSubject<
    Record<Market, FixedArray<number, 12>>
  >(
    localStorage.getItem('rates') === null
      ? defaultRates
      : (JSON.parse(localStorage.getItem('rates')!) as Record<
          Market,
          FixedArray<number, 12>
        >),
  );

  rates$ = this.ratesSubject.asObservable();

  setRates(rates: Record<Market, FixedArray<number, 12>>) {
    localStorage.setItem('rates', JSON.stringify(rates));
    this.ratesSubject.next(rates);
  }
}
