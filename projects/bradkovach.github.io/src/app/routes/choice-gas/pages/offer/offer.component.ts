import { AsyncPipe, DecimalPipe, JsonPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { AppComponent } from '../../../../app.component';
import { BillComponent } from '../../components/bill/bill.component';
import { marketLabels } from '../../data/data.current';

import { Offer } from '../../entity/Offer';
import { Vendor } from '../../entity/Vendor';

import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { BillPipe } from '../../pipes/bill/bill.pipe';
import { PhonePipe } from '../../pipes/phone/phone.pipe';
import { DataService } from '../../services/data/data.service';
import { Month, monthLabels } from '../explorer/explorer.component';

@Component({
  selector: 'app-offer',
  standalone: true,
  imports: [
    AsyncPipe,
    JsonPipe,
    PhonePipe,
    DecimalPipe,
    BillComponent,
    BillPipe,
    FormsModule,
  ],
  templateUrl: './offer.component.html',
  styleUrl: './offer.component.scss',
})
export class OfferComponent {
  readonly MonthKeys = Object.keys(monthLabels) as unknown as Month[];
  readonly MonthLabels = monthLabels;
  readonly MarketLabels = marketLabels;
  readonly appComponent = inject(AppComponent);

  vendorId = input.required<string>();
  offerId = input.required<string>();

  readonly dataService = inject(DataService);

  usage$ = this.dataService.usage$;
  charges$ = this.dataService.charges$;
  rates$ = this.dataService.rates$;

  data$ = combineLatest({
    usage: this.usage$,
    charges: this.charges$,
    rates: this.rates$,
  });

  vendor$ = this.dataService.vendors$.pipe(
    map((vendors) => vendors.find((vendor) => vendor.id === this.vendorId())),
  );

  offer$ = this.vendor$.pipe(
    map((vendor) => vendor?.offers.get(this.offerId())),
  );

  constructor(title: Title) {
    this.appComponent.setContainerMode('fixed');

    combineLatest({
      vendor: this.vendor$,
      offer: this.offer$,
    }).subscribe(({ vendor, offer }) => {
      if (vendor && offer) {
        title.setTitle(`Choice Gas - ${vendor.name} - ${offer.name}`);
      }
    });
  }

  readonly router = inject(Router);

  getShareLink(
    vendor: Vendor | undefined | null,
    offer: Offer | undefined | null,
  ) {
    return (
      'https://bradkovach.github.io' +
      this.router.serializeUrl(
        this.router.createUrlTree(['/choice-gas/import'], {
          queryParams: {
            vendor: JSON.stringify(vendor),
            offer: JSON.stringify(offer),
          },
          relativeTo: this.router.routerState.root,
        }),
      )
    );
  }

  copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }

  setOverride(
    vendor: Vendor | undefined | null,
    offer: Offer | undefined | null,
    value: string,
  ) {
    if (!vendor) {
      return;
    }
    if (!offer) {
      return;
    }

    this.dataService.setRateOverrides({
      [`@${vendor.id}/${offer.id}`]: Number(value),
    });
  }
}
