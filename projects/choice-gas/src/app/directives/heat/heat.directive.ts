import { computed, Directive, input } from '@angular/core';
import chroma from 'chroma-js';

type HeatScheme = {
	contrastColor: string;
	heatColor: string;
};

@Directive({
	host: {
		'[style.--heat-color]': 'styles()?.heatColor',
		'[style.--heat-contrast-color]': 'styles()?.contrastColor',
		'[style.backgroundColor]': 'styles()?.heatColor',
		'[style.color]': 'styles()?.contrastColor',
	},
	selector: `[heat]`,
})
export class HeatDirective {
	readonly heat = input(true);

	readonly scale = input.required<chroma.Scale<chroma.Color>>();

	readonly value = input.required<number>();

	readonly values = input<number[]>();

	readonly styles = computed((): HeatScheme | null => {
		const value = this.value();
		const domain = this.values();
		if (
			!this.heat() ||
			value === null ||
			value === undefined ||
			Number.isNaN(value)
		) {
			return null;
		}

		let scale = this.scale();
		if (domain && domain.length > 0) {
			scale = scale.domain(domain.sort((a, b) => a - b));
		}

		const heatColor = scale(value).hex();
		const contrastColor =
			chroma.contrast(heatColor, '#000') > 4.5 ? '#000' : '#fff';

		return {
			contrastColor,
			heatColor,
		};
	});
}
