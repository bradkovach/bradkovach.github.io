import type { PipeTransform } from '@angular/core';

import { Pipe } from '@angular/core';

@Pipe({
  name: 'inclusiveRange',
  standalone: true,
})
export class InclusiveRangePipe implements PipeTransform {
  transform(max: number, ...args: unknown[]): number[] {
    return Array.from(Array(max + 1).keys());
  }
}
