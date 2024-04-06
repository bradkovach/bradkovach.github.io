import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { combineLatest, map, tap } from 'rxjs';

import { BillTotalComponent } from '../../bill-total/bill-total.component';
import { BillComponent } from '../../components/bill/bill.component';
import { Market, marketLabels } from '../../data/data.current';
import { lastUpdated } from '../../data/last-updated';
import { ChargeType } from '../../entity/ChargeType';
import { OfferType } from '../../entity/Offer';
import { AveragePipe } from '../../pipes/average/average.pipe';
import { createBill } from '../../pipes/bill/bill.pipe';
import { HeatPipe } from '../../pipes/heat/heat.pipe';
import { PhonePipe } from '../../pipes/phone/phone.pipe';
import { SortPipe } from '../../pipes/sort/sort.pipe';
import { DataService } from '../../services/data/data.service';
import { storageSignal } from './localStorageSignal';

@Component({
  selector: 'app-choice-gas-calculator',
  standalone: true,
  imports: [
    FormsModule,
    BillComponent,
    DecimalPipe,
    AsyncPipe,
    RouterLink,
    AveragePipe,
    PhonePipe,
    DatePipe,
    HeatPipe,
    SortPipe,
    BillTotalComponent,
  ],
  templateUrl: './explorer.component.html',

  styleUrls: [`./explorer.component.scss`],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerComponent {
  private readonly dataService = inject(DataService);

  readonly ChargeType = ChargeType;

  readonly Heatmap = Heatmap;
  readonly Heatmaps = Object.keys(heatmapsLabels) as unknown as Heatmap[];
  readonly HeatmapLabels: Record<Heatmap, string> = heatmapsLabels;

  readonly HeatmapScheme = HeatmapScheme;
  readonly HeatmapSchemes = Object.keys(
    heatmapSchemeLabels,
  ) as unknown as HeatmapScheme[];
  readonly HeatmapSchemeLabels: Record<HeatmapScheme, string> =
    heatmapSchemeLabels;

  readonly HeatmapSchemePalettes: Record<HeatmapScheme, string[]> =
    heatmapSchemePalettes;

  readonly Market = Market;
  readonly MarketLabels = marketLabels;
  readonly Markets = Object.keys(marketLabels) as unknown as Market[];

  readonly Month = Month;
  readonly MonthLabels = monthLabels;
  readonly Months = Object.keys(monthLabels) as unknown as Month[];

  readonly OfferTypeLabels: Record<OfferType, string> = offerTypeLabels;
  readonly OfferTypes = Object.keys(offerTypeLabels) as unknown as OfferType[];

  readonly averages = signal<number[]>([]);
  readonly enabledOfferTypes = storageSignal<
    Record<OfferType, boolean>,
    SettingsKey
  >(SettingsKey.EnabledOfferTypes, {
    fpt: true,
    fpm: true,
    market: true,
    best: true,
    blended: true,
    custom: true,
  });
  readonly heatmapsEnabled = storageSignal<Record<Heatmap, boolean>>(
    SettingsKey.EnabledHeatmaps,
    {
      [Heatmap.Averages]: true,
      [Heatmap.Totals]: true,
      [Heatmap.Usage]: true,
    },
  );
  readonly highest = computed(() => {
    const avgs = this.averages();
    return avgs.length > 0 ? avgs[avgs.length - 1] : Number.MIN_VALUE;
  });
  readonly lastUpdated = new Date(lastUpdated);
  readonly lowest = computed(() =>
    this.averages().length > 0 ? this.averages()[0] : Number.MAX_VALUE,
  );
  // readonly vendors = vendors;
  // readonly marketLabels = marketLabels;
  readonly monthLabelsAbbr = monthLabelsAbbr;
  readonly palette = computed(() => this.HeatmapSchemePalettes[this.scheme()]);
  readonly scheme = storageSignal(
    SettingsKey.Scheme,
    HeatmapScheme.GreenWhiteRed,
    (s) => JSON.stringify(Number(s)),
  );
  readonly totals = signal<number[]>([]);
  readonly vm$ = combineLatest({
    vendors: this.dataService.vendors$,
    usage: this.dataService.usage$,
    charges: this.dataService.charges$,
    rates: this.dataService.rates$,
    enabledOfferTypes: toObservable(this.enabledOfferTypes),
  }).pipe(
    map((vm) => {
      return {
        ...vm,
        vendors: vm.vendors.map((vendor) => {
          const offers = [...vendor.offers.values()]
            .filter((offer) => this.enabledOfferTypes()[offer.type])
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
      this.totals.set(
        vm.vendors.flatMap((vendor) =>
          vendor.offers
            .filter((o) => {
              if (o.offer.type === 'fpm' && o.offer.rate === 0) {
                return false;
              }
              return true;
            })
            .flatMap((offer) => offer.bills.flatMap((b) => b.bill.total))
            // ascending
            .sort((a, b) => a - b),
        ),
      );

      this.averages.set(
        vm.vendors
          .flatMap((vendor) =>
            vendor.offers
              .filter((o) => {
                if (o.offer.type === 'fpm' && o.offer.rate === 0) {
                  return false;
                }
                return true;
              })
              .map((offer) => offer.average),
          )
          // ascending
          .sort((a, b) => a - b),
      );
    }),
  );

  constructor(title: Title) {
    title.setTitle('Choice Gas - Price Explorer');
  }

  setHeatmap(heatmap: Heatmap, enabled: boolean) {
    this.heatmapsEnabled.set({
      ...this.heatmapsEnabled(),
      [heatmap]: enabled,
    });
  }

  setOfferType(offerType: OfferType, enabled: boolean) {
    this.enabledOfferTypes.set({
      ...this.enabledOfferTypes(),
      [offerType]: enabled,
    });
  }

  resetRefiners() {
    this.enabledOfferTypes.set({
      fpt: true,
      fpm: true,
      market: true,
      best: true,
      blended: true,
      custom: true,
    });
    this.heatmapsEnabled.set({
      [Heatmap.Averages]: true,
      [Heatmap.Totals]: true,
      [Heatmap.Usage]: true,
    });
  }
}

enum Heatmap {
  Averages,
  Totals,
  Usage,
}

enum HeatmapScheme {
  None,
  BlackWhite,
  GreenYellowRed,
  WhiteRed,
  WhiteBlue,
  WhitePurple,
  WhiteYellow,
  GreenWhiteRed,
  BlueWhiteYellow,
  BlueWhiteRed,
  GreenWhitePurple,
}

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

export enum SettingsKey {
  Scheme = 'scheme',
  EnabledOfferTypes = 'enabledOfferTypes',
  Charges = 'charges',
  RateOverrides = 'rateOverrides',
  Usage = 'usage',
  EnabledHeatmaps = 'enabledHeatmaps',
  Rates = 'rates',
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
const white = '#ffffff';
const black = '#000000';
const green = '#63be7a';
const yellow = '#fedc80';
const red = '#f8696b';
const blue = '#025196';
const purple = '#6a0572';
const heatmapSchemePalettes = {
  [HeatmapScheme.BlackWhite]: [black, white],
  [HeatmapScheme.BlueWhiteRed]: [blue, white, red],
  [HeatmapScheme.BlueWhiteYellow]: [blue, white, yellow],
  [HeatmapScheme.GreenWhiteRed]: [green, white, red],
  [HeatmapScheme.GreenYellowRed]: [green, yellow, red],
  [HeatmapScheme.None]: [white],
  [HeatmapScheme.GreenWhitePurple]: [green, white, purple],
  [HeatmapScheme.WhiteBlue]: [white, blue],
  [HeatmapScheme.WhitePurple]: [white, purple],
  [HeatmapScheme.WhiteRed]: [white, red],
  [HeatmapScheme.WhiteYellow]: [white, yellow],
};
const heatmapSchemeLabels = {
  [HeatmapScheme.BlackWhite]: 'Black/White',
  [HeatmapScheme.BlueWhiteRed]: 'Blue/White/Red',
  [HeatmapScheme.BlueWhiteYellow]: 'Blue/White/Yellow',
  [HeatmapScheme.GreenWhiteRed]: 'Green/White/Red',
  [HeatmapScheme.GreenYellowRed]: 'Green/Yellow/Red',
  [HeatmapScheme.None]: 'None',
  [HeatmapScheme.GreenWhitePurple]: 'Green/White/Purple',
  [HeatmapScheme.WhiteBlue]: 'White/Blue',
  [HeatmapScheme.WhitePurple]: 'White/Purple',
  [HeatmapScheme.WhiteRed]: 'White/Red',
  [HeatmapScheme.WhiteYellow]: 'White/Yellow',
};
const heatmapsLabels = {
  [Heatmap.Averages]: 'Averages',
  [Heatmap.Totals]: 'Totals',
  [Heatmap.Usage]: 'Therm Usage',
};
const offerTypeLabels = {
  fpt: 'Fixed/Therm',
  fpm: 'Fixed/Month',
  market: 'Market',
  best: 'Best Of',
  blended: 'Blended',
  custom: 'Custom',
};
