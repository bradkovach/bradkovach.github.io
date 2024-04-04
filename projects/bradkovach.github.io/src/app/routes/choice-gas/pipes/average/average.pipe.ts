import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'average',
  standalone: true,
})
export class AveragePipe implements PipeTransform {
  transform(numbers: number[]): number {
    return numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
  }
}