import { Component, computed, inject, input } from '@angular/core';

import { FootnoteService } from '../../services/footnote/footnote.service';

@Component({
	selector: 'footnote',
	styles: `
		:host {
			display: inline-block;
			padding: 0 0.25em;
			cursor: help;
		}
	`,
	template: ` <sup [title]="ref().text">{{ ref().glyph }}</sup> `,
})
export class FootnoteComponent {
	readonly text = input.required<string>();

	readonly #footnoteService = inject(FootnoteService);

	readonly ref = computed(() =>
		this.#footnoteService.getFootnoteRef(this.text()),
	);
}
