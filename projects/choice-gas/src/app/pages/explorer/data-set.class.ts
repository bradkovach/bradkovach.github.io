import { computed, signal } from '@angular/core';

export const enum DataSeriesDirection {
	Ascending = -1,
	Descending = 1,
}

export class DataSeries {
	readonly #abbr = signal('');

	readonly abbr = this.#abbr.asReadonly();

	readonly #values = signal<number[]>([], { equal: () => false });

	readonly average = computed(() => {
		const values = this.#values();
		return values.reduce((sum, value) => sum + value, 0) / values.length;
	});

	readonly #direction = signal(DataSeriesDirection.Ascending);

	readonly direction = this.#direction.asReadonly();

	readonly #label = signal('');

	readonly label = this.#label.asReadonly();

	readonly size = computed(() => this.#values().length);

	readonly length = this.size;

	readonly max = computed(() => Math.max(...this.#values()));

	readonly sorted = computed(() =>
		[...this.#values()].sort((a, b) => this.#direction() * (a - b)),
	);

	readonly median = computed(() => {
		const sorted = this.sorted();
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 !== 0
			? sorted[mid]
			: (sorted[mid - 1] + sorted[mid]) / 2;
	});

	readonly min = computed(() => Math.min(...this.#values()));

	constructor(
		label: string,
		abbr: string,
		values: number[],
		direction: DataSeriesDirection = DataSeriesDirection.Ascending,
	) {
		this.#label.set(label);
		this.#abbr.set(abbr);
		this.#values.set(values);
		this.#direction.set(direction);
	}
}
