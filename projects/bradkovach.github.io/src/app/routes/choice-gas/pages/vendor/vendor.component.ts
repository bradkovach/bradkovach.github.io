import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';

import { map } from 'rxjs';

import { DataService } from '../../services/data/data.service';

import { PhonePipe } from '../../pipes/phone/phone.pipe';

@Component({
    imports: [PhonePipe, AsyncPipe],
    selector: 'app-vendor',
    styleUrl: './vendor.component.scss',
    templateUrl: './vendor.component.html'
})
export class VendorComponent {
  readonly dataService = inject(DataService);

  vendorId = input.required<string>();

  vendor$ = this.dataService.vendors$.pipe(
    map((vendors) => vendors.find((vendor) => vendor.id === this.vendorId())),
  );
}
