import {
  AsyncPipe,
  DecimalPipe,
  JsonPipe,
  NgTemplateOutlet,
} from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import z from 'zod';
import { Market } from '../../data/data.current';
import {
  BestOffer,
  BlendedOffer,
  FixedPerMonthOffer,
  FixedPerThermOffer,
  MarketOffer,
  OfferBase,
  OfferSchema,
} from '../../entity/Offer';
import { DataService } from '../../services/data/data.service';

const VendorSchema = z.object({
  name: z.string().min(2),
  id: z.string().min(2),
  offers: z.array(OfferSchema),
  phone: z.string(),
});

@Component({
  selector: 'app-cg-import',
  standalone: true,
  imports: [AsyncPipe, JsonPipe, NgTemplateOutlet, DecimalPipe, FormsModule],
  templateUrl: './import.component.html',
  styleUrl: './import.component.scss',
})
export class ImportComponent {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);

  vm$ = combineLatest({
    usage: this.dataService.usage$,
    charges: this.dataService.charges$,
    rates: this.dataService.rates$,
  });

  vendors$ = this.route.queryParamMap.pipe(
    map((p) => {
      const vendor = p.getAll('vendor');
      if (!vendor) return [];
      console.log(vendor);

      return vendor.map((vendor) => {
        return { import: true, vendor: VendorSchema.parse(JSON.parse(vendor)) };
      });
    }),
  );

  offers$ = this.route.queryParamMap.pipe(
    map((p) => {
      const offers = p.getAll('offer');
      if (!offers) return [];
      console.log(offers);

      return offers.map((offer) => {
        return { import: true, offer: OfferSchema.parse(JSON.parse(offer)) };
      });
    }),
  );

  constructor(title: Title) {
    title.setTitle('Choice Gas - Import Data');
    const query = new URLSearchParams();
    const fpmOffer: OfferBase & FixedPerMonthOffer = {
      id: '185',
      name: 'FPM @ $90 x 2 years',
      type: 'fpm',
      rate: 90,
      term: 2,
    };
    query.append('offer', JSON.stringify(fpmOffer));

    const fptOffer: OfferBase & FixedPerThermOffer = {
      id: '186',
      name: 'FPT @ $0.25',
      type: 'fpt',
      rate: 0.25,
      term: 1,
      vendor_id: 'com.choicegas',
    };
    query.append('offer', JSON.stringify(fptOffer));

    const indexOffer: OfferBase & MarketOffer = {
      id: '187',
      name: 'Index @ $0.25',
      type: 'market',
      market: Market.CIG,
      rate: 0.25,
      term: 1,
    };
    query.append('offer', JSON.stringify(indexOffer));

    const gcaOffer: OfferBase & MarketOffer = {
      id: '188',
      name: 'GCA @ $0.25',
      type: 'market',
      market: Market.GCA,
      rate: 0.25,
      term: 1,
    };
    query.append('offer', JSON.stringify(gcaOffer));

    const blendedOffer: OfferBase & BlendedOffer = {
      id: '189',
      name: 'Blended',
      type: 'blended',
      term: 1,
      offers: [
        [0.25, fptOffer],
        [0.25, indexOffer],
        [0.25, gcaOffer],
      ],
    };
    query.append('offer', JSON.stringify(blendedOffer));

    const bestOffer: OfferBase & BestOffer = {
      id: '190',
      name: 'Best',
      type: 'best',
      term: 1,
      offers: [fptOffer, fpmOffer, indexOffer, gcaOffer],
    };
    query.append('offer', JSON.stringify(bestOffer));

    console.log({ q: query.toString() });
  }
}
