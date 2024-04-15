import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'sort',
	standalone: true,
})
export class SortPipe implements PipeTransform {
	transform(value: number[], direction: 1 | -1 = 1): number[] {
		return value.slice().sort((a, b) => (a - b) * direction);
	}
}
