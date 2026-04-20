import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { HeatmapScheme } from '../../../data/enum/heatmap.enum';
import type { OfferType } from '../../../schema/offer.z';

import { SeriesLabels } from '../../../data/data.default';
import {
	Heatmap,
	heatmapSchemeLabels,
	heatmapsLabels,
} from '../../../data/enum/heatmap.enum';
import { HeatmapManager } from '../../../services/heatmap-manager/heatmap-manager.service';
import { explorerColumnLabels } from '../ExplorerColumn';
import { extractKeys } from '../extractKeys';
import { PreferencesService } from '../preferences.service';

const offerTypeLabels = {
	best: 'Best Of',
	blended: 'Blended',
	custom: 'Custom',
	fpm: 'Fixed/Month',
	fpt: 'Fixed/Therm',
	market: 'Market',
};

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [FormsModule],
	selector: 'app-explorer-settings',
	templateUrl: 'explorer-settings.component.html',
})
export class ExplorerSettingsComponent {
	readonly ExplorerColumnLabels = explorerColumnLabels;

	readonly ExplorerColumns = extractKeys(this.ExplorerColumnLabels);

	readonly Heatmap = Heatmap;

	readonly HeatmapLabels = heatmapsLabels;

	readonly Heatmaps = extractKeys(this.HeatmapLabels);

	readonly HeatmapSchemeLabels = heatmapSchemeLabels;

	readonly HeatmapSchemes = extractKeys(this.HeatmapSchemeLabels);

	readonly OfferTypeLabels = offerTypeLabels;

	readonly OfferTypes = Object.keys(this.OfferTypeLabels) as OfferType[];

	readonly preferences = inject(PreferencesService);

	readonly #heatmapManager = inject(HeatmapManager);

	readonly scheme = this.#heatmapManager.scheme;

	readonly SeriesKeys = extractKeys(SeriesLabels);

	readonly SeriesLabels = SeriesLabels;

	readonly showSettings = signal(false);

	setScheme(scheme: HeatmapScheme) {
		this.#heatmapManager.setScheme(scheme);
	}

	setShowSettings(open: boolean) {
		this.showSettings.set(open);
	}
}
