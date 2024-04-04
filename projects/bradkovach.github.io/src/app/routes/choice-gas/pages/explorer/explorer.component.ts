// import { AgGridAngular } from '@ag-grid-community/angular';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import {
// 	ColDef,
// 	ModuleRegistry,
// 	ValueFormatterParams,
// 	ValueGetterParams,
// } from '@ag-grid-community/core';
import {
  AsyncPipe,
  DatePipe,
  DecimalPipe,
  JsonPipe,
  KeyValuePipe,
} from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ReplaySubject, combineLatest, map, tap } from 'rxjs';
import { AppComponent } from '../../../../app.component';
import { BillComponent } from '../../components/bill/bill.component';
import { Market, marketLabels } from '../../data/data.current';
import { lastUpdated } from '../../data/last-updated';
import { vendors } from '../../data/vendors';
import { ChargeType } from '../../entity/ChargeType';
import { AveragePipe } from '../../pipes/average/average.pipe';
import { BillPipe, createBill } from '../../pipes/bill/bill.pipe';
import { PhonePipe } from '../../pipes/phone/phone.pipe';
import { DataService } from '../../services/data/data.service';

export enum Month {
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December,
}

export const monthLabels: Record<Month, string> = {
  [Month.January]: 'January',
  [Month.February]: 'February',
  [Month.March]: 'March',
  [Month.April]: 'April',
  [Month.May]: 'May',
  [Month.June]: 'June',
  [Month.July]: 'July',
  [Month.August]: 'August',
  [Month.September]: 'September',
  [Month.October]: 'October',
  [Month.November]: 'November',
  [Month.December]: 'December',
};

export const monthLabelsAbbr: Record<Month, string> = {
  [Month.January]: 'Jan',
  [Month.February]: 'Feb',
  [Month.March]: 'Mar',
  [Month.April]: 'Apr',
  [Month.May]: 'May',
  [Month.June]: 'Jun',
  [Month.July]: 'Jul',
  [Month.August]: 'Aug',
  [Month.September]: 'Sep',
  [Month.October]: 'Oct',
  [Month.November]: 'Nov',
  [Month.December]: 'Dec',
};

// ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  selector: 'app-choice-gas-calculator',
  standalone: true,
  imports: [
    FormsModule,
    JsonPipe,
    BillPipe,
    BillComponent,
    KeyValuePipe,
    DecimalPipe,
    // AgGridAngular,
    AsyncPipe,
    RouterLink,
    AveragePipe,
    PhonePipe,
    DatePipe,
  ],
  templateUrl: './explorer.component.html',

  styleUrls: [`./explorer.component.scss`],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerComponent {
  // readonly vendors = vendors;
  readonly marketLabels = marketLabels;
  readonly monthLabelsAbbr = monthLabelsAbbr;
  readonly lastUpdated = new Date(lastUpdated);

  readonly dataService = inject(DataService);

  readonly ChargeType = ChargeType;

  private readonly showSubject = new ReplaySubject<
    'total' | 'dollarsPerTherm' | 'thermsPerDollar'
  >(1);

  vm$ = combineLatest({
    usage: this.dataService.usage$,
    charges: this.dataService.charges$,
    rates: this.dataService.rates$,
    show: this.showSubject.asObservable(),
  }).pipe(
    map((vm) => {
      return {
        ...vm,
        vendors: this.vendors.map((vendor) => {
          const offers = [...vendor.offers.values()]
            .map((offer) => ({
              offer,
              average: 0,
              bills: vm.usage
                .map((_, i) =>
                  createBill(offer, i, vm.usage, vm.charges, vm.rates),
                )
                .map((bill, i) => ({ bill, rankInYear: -1 }))
                // sort by total, ascending
                .sort((a, b) => a.bill.total - b.bill.total)
                // project to include rank
                .map((ranked, i) => {
                  return { bill: ranked.bill, rank: i + 1 };
                })
                // sort by bill month, ascending
                .sort((a, b) => a.bill.month - b.bill.month),
            }))
            .map((vendorGroup) => {
              const yearTotal = vendorGroup.bills.reduce(
                (sum, { bill }) => sum + bill.total,
                0,
              );
              vendorGroup.average = yearTotal / vendorGroup.bills.length;
              return vendorGroup;
            })
            .sort((a, b) => a.average - b.average);

          return {
            vendor: vendor,
            offers,
          };
        }),
      };
    }),

    tap((vm) => {
      console.log('View Model update', vm);
    }),
  );

  get MonthKeys(): Month[] {
    return Object.keys(monthLabels) as unknown as Month[];
  }

  get MonthLabels(): string[] {
    return Object.values(monthLabels);
  }

  get MarketKeys(): Market[] {
    return Object.keys(marketLabels) as unknown as Market[];
  }

  readonly appComponent = inject(AppComponent);

  constructor(title: Title) {
    title.setTitle('Choice Gas - Price Explorer');
    this.appComponent.setContainerMode('fluid');
    this.showSubject.next('total');
  }

  vendors = vendors;

  setShow(show: 'total' | 'dollarsPerTherm' | 'thermsPerDollar') {
    this.showSubject.next(show);
  }
}
