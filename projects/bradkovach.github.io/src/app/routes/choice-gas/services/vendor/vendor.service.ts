import { Injectable } from '@angular/core';
import { Subject, map, scan } from 'rxjs';
import { Vendor } from '../../entity/Vendor';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  constructor() {}

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

  addVendor(vendor: Vendor) {
    this.vendorSubject.next(vendor);
  }
}
