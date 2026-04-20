import { computed, Injectable, type Signal } from '@angular/core';
import chroma from 'chroma-js';
import { storageSignal } from 'ngx-oneforall/signals/storage-signal';

import {
	HeatmapScheme,
	heatmapSchemePalettes,
} from '../../data/enum/heatmap.enum';
import { Setting } from '../../data/enum/settings.enum';

@Injectable({
	providedIn: 'root',
})
export class HeatmapManager {
	readonly palette = computed(() => heatmapSchemePalettes[this.#scheme()]);

	readonly #scheme = storageSignal<HeatmapScheme>(
		Setting.Scheme,
		HeatmapScheme.GreenWhiteRed,
	);

	readonly scheme = this.#scheme.asReadonly();

	scaleFor = (values: Signal<number[]>) =>
		computed(() => {
			return chroma.scale(this.palette()).domain(values());
		});

	setScheme(scheme: HeatmapScheme) {
		this.#scheme.set(scheme);
	}
}
