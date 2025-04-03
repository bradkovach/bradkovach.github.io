import type { PipeTransform } from '@angular/core';

import { Pipe } from '@angular/core';

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
		mode: 'bg' | 'fg' = 'bg',
	): null | { backgroundColor: string; color: string } {
		const idx = values.indexOf(value);
		if (idx === -1) {
			return null;
		}
		const f = scale(colors);
		const heatColor = f(idx / (values.length - 1))
			.alpha(1)
			.css();
		const contrastColor =
			contrast(heatColor, '#000') > 4.5 ? '#000' : '#fff';

		return mode === 'bg'
			? { backgroundColor: heatColor, color: contrastColor }
			: { backgroundColor: contrastColor, color: heatColor };
	}
}
