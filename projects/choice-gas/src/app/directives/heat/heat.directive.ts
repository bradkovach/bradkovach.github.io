import { computed, Directive, input } from '@angular/core';
import chroma from 'chroma-js';

type HeatScheme = {
	contrastColor: string;
	heatColor: string;
	heatShaded: string;
};

@Directive({
	host: {
		'[class.heat]': 'heat',
		'[style.--heat-color]': 'styles()?.heatColor',
		'[style.--heat-contrast-color]': 'styles()?.contrastColor',
		'[style.--heat-shaded]': 'styles()?.heatShaded',
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

		const heatColor = scale(value);
		const contrastColor =
			chroma.contrast(heatColor, '#000') > 4.5 ? '#000' : '#fff';
		const heatShaded = chroma(heatColor).saturate(3).darken(2);

		return {
			contrastColor,
			heatColor: heatColor.hex(),
			heatShaded: heatShaded.hex(),
		};
	});
}
