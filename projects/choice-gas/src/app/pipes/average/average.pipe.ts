import type { PipeTransform } from '@angular/core';

import { Pipe } from '@angular/core';

@Pipe({
	name: 'average',
	pure: true,
	standalone: true,
})
export class AveragePipe implements PipeTransform {
	transform(numbers: number[]): number {
		if (numbers.length === 0) {
			return NaN;
		}
		return numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
	}
}
