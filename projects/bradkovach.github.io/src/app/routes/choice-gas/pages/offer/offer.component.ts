import { AsyncPipe, DecimalPipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { AppComponent } from '../../../../app.component';
import { BillComponent } from '../../components/bill/bill.component';
import { marketLabels } from '../../data.current';
import { vendors } from '../../data/vendors';

import { Offer } from '../../entity/Offer';
import { Vendor } from '../../entity/Vendor';

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

  vendor = computed(() => vendors.find((v) => v.id === this.vendorId()));

  offer = computed(() => this.vendor()!.offers.get(this.offerId()));

  constructor() {
    this.appComponent.setContainerMode('fixed');
  }

  readonly router = inject(Router);

  getShareLink(vendor: Vendor | undefined, offer: Offer | undefined) {
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
}
