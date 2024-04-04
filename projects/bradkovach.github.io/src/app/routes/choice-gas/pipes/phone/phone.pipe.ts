import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone',
  standalone: true,
})
export class PhonePipe implements PipeTransform {
  transform(digits: string, ...args: unknown[]): unknown {
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(
        6,
        10,
      )}`;
    } else if (digits.length === 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}`;
    } else {
      return digits;
    }
  }
}
