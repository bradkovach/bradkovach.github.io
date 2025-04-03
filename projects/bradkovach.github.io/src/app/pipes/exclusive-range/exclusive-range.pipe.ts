import type { PipeTransform } from '@angular/core';

import { Pipe } from '@angular/core';

@Pipe({
  name: 'exclusiveRange',
  standalone: true,
})
export class ExclusiveRangePipe implements PipeTransform {
  transform(max: number, ...args: unknown[]): number[] {
    return Array.from(Array(max).keys());
  }
}
