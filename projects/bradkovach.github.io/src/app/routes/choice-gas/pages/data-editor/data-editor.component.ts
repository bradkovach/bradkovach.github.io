import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, combineLatest, map, merge } from 'rxjs';

import { Title } from '@angular/platform-browser';
import { Market, marketLabels } from '../../data/data.current';
import {
  defaultCharges,
  defaultRates,
  defaultUsage,
} from '../../data/data.default';
import { Charge } from '../../entity/Charge';
import { ChargeType } from '../../entity/ChargeType';
import { FixedArray } from '../../entity/FixedArray';
import { DataService } from '../../services/data/data.service';
import { Month, monthLabels } from '../explorer/explorer.component';

@Component({
  selector: 'app-data-editor',
  standalone: true,
  imports: [FormsModule, AsyncPipe, RouterLink],
  templateUrl: './data-editor.component.html',
  styleUrl: './data-editor.component.scss',
})
export class DataEditorComponent {
  private dataService = inject(DataService);

  readonly ChargeType = ChargeType;
  readonly MonthKeys = Object.keys(monthLabels) as unknown as Month[];
  readonly MonthLabels = monthLabels;
  readonly MarketKeys = Object.keys(marketLabels) as unknown as Market[];
  readonly MarketLabels = marketLabels;

  private lockSubject = new Subject<Record<Market, boolean>>();

  vm$ = combineLatest({
    usage: this.dataService.usage$,
    charges: this.dataService.charges$,
    rates: this.dataService.rates$,
    locks: merge(
      this.dataService.rates$.pipe(
        map((rates) => {
          const locks = {} as Record<Market, boolean>;
          for (const market of this.MarketKeys) {
            locks[market] = rates[market].every(
              (rate, i, arr) => rate === arr[0],
            );
          }
          return locks;
        }),
      ),
      this.lockSubject.asObservable(),
    ),
  });

  constructor(title: Title) {
    title.setTitle('Choice Gas - Data Editor');
  }

  addCharge(charges: Charge[]) {
    const update = [...charges];
    update.push({ name: '', rate: 0, type: ChargeType.PerTherm });
    this.dataService.setCharges(update);
  }

  removeCharge(index: number, charges: Charge[]) {
    const newCharges = [...charges] as Charge[];
    newCharges.splice(index, 1);
    this.dataService.setCharges(newCharges);
  }

  setCharge(partialCharge: Partial<Charge>, index: number, charges: Charge[]) {
    const oldCharge = charges[index];
    const newCharges = [...charges] as Charge[];
    newCharges[index] = { ...oldCharge, ...partialCharge };

    const type = newCharges[index].type;
    if (typeof type === 'string' && type in ChargeType) {
      newCharges[index].type = ChargeType[type] as unknown as ChargeType;
    }

    this.dataService.setCharges(newCharges);
  }

  resetCharges() {
    this.dataService.setCharges(defaultCharges);
  }

  sortCharges(charges: Charge[]) {
    const newCharges = [...charges] as Charge[];
    newCharges.sort((a, b) => a.type - b.type);
    this.dataService.setCharges(newCharges);
  }

  setUsage(
    value: string | number,
    index: number,
    usage: FixedArray<number, 12>,
  ): void {
    const newUsage = [...usage] as FixedArray<number, 12>;
    newUsage[index] = Number(value);
    this.dataService.setUsage(newUsage);
  }

  resetUsage() {
    this.dataService.setUsage(defaultUsage);
  }

  setRate(
    rate: string | number,
    market: Market,
    rateIdx: number,
    rates: Record<Market, FixedArray<number, 12>>,
    lock: boolean,
  ): void {
    const newRates = { ...rates } as Record<Market, FixedArray<number, 12>>;
    // if locked, all the values are the same
    if (lock) {
      for (let i = 0; i < 12; i++) {
        newRates[market][i] = Number(rate);
      }
    } else {
      newRates[market][rateIdx] = Number(rate);
    }
    this.dataService.setRates(newRates);
  }

  resetRates() {
    this.dataService.setRates(defaultRates);
  }

  setLock(market: Market, lock: boolean, locks: Record<Market, boolean>) {
    const newLocks = { ...locks } as Record<Market, boolean>;
    newLocks[market] = lock;
    this.lockSubject.next(newLocks);
  }
}
