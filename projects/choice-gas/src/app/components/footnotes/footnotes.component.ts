import { Component, inject } from '@angular/core';

import { FootnoteService } from '../../services/footnote/footnote.service';

@Component({
	selector: 'footnotes',
	styles: `
		.footnotes {
			margin: 0;
			padding: 0;
			list-style: none;
			font-size: 0.9em;
		}
	`,
	template: `
		<ul class="footnotes">
			@for (footnote of footnotes(); track $index) {
				<li>{{ footnote.glyph }} {{ footnote.text }}</li>
			} @empty {
				<li><em>There are no footnotes.</em></li>
			}
		</ul>
	`,
})
export class FootnotesComponent {
	readonly #footnotesService = inject(FootnoteService);

	readonly footnotes = this.#footnotesService.footnotes;
}
