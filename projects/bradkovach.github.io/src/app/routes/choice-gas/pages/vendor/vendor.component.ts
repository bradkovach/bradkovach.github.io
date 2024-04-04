import { Component, computed, input } from '@angular/core';
import vendors from '../../data/vendors';
import { PhonePipe } from '../../pipes/phone/phone.pipe';

@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [PhonePipe],
  templateUrl: './vendor.component.html',
  styleUrl: './vendor.component.scss',
})
export class VendorComponent {
  vendorId = input.required<string>();

  vendor = computed(() => {
    return vendors.find((vendor) => vendor.id === this.vendorId());
  });
}
