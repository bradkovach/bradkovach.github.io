import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { map } from 'rxjs';
import { PhonePipe } from '../../pipes/phone/phone.pipe';
import { DataService } from '../../services/data/data.service';

@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [PhonePipe, AsyncPipe],
  templateUrl: './vendor.component.html',
  styleUrl: './vendor.component.scss',
})
export class VendorComponent {
  vendorId = input.required<string>();

  readonly dataService = inject(DataService);

  vendor$ = this.dataService.vendors$.pipe(
    map((vendors) => vendors.find((vendor) => vendor.id === this.vendorId())),
  );
}
