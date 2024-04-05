import { Pipe, PipeTransform } from '@angular/core';
import { contrast, scale } from 'chroma-js';

@Pipe({
  name: 'heat',
  standalone: true,
})
export class HeatPipe implements PipeTransform {
  transform(
    value: number,
    values: number[],
    colors: string[],
  ): null | { backgroundColor: string; color: string } {
    // console.count('heatpipe');
    const idx = values.indexOf(value);
    if (idx === -1) {
      return null;
    }
    const f = scale(colors);
    const backgroundColor = f(idx / (values.length - 1))
      .alpha(1)
      .css();
    const color = contrast(backgroundColor, '#000') > 4.5 ? '#000' : '#fff';

    return { backgroundColor, color };
  }
}
