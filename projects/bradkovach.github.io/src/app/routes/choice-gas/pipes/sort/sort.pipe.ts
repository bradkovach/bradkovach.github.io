import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
  standalone: true,
})
export class SortPipe implements PipeTransform {
  transform(value: number[]): number[] {
    return value.slice().sort((a, b) => a - b);
  }
}
