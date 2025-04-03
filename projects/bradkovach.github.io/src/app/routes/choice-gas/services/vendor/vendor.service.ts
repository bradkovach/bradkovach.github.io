import type { Vendor } from '../../entity/Vendor';

import { Injectable } from '@angular/core';

import { map, scan, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private vendorSubject = new Subject<Vendor>();

  vendor$ = this.vendorSubject.asObservable();

  vendorMap$ = this.vendor$.pipe(
    scan((vendorMap, vendor) => {
      vendorMap.set(vendor.id, vendor);
      return vendorMap;
    }, new Map<string, Vendor>()),
  );

  vendorEntries$ = this.vendorMap$.pipe(
    map((vendorMap) => Array.from(vendorMap.entries())),
  );

  constructor() {}

  addVendor(vendor: Vendor) {
    this.vendorSubject.next(vendor);
  }
}
