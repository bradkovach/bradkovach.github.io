import { computed, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

// common footnote symbols: *, †, ‡, §, ¶, #, **, ††, ‡‡, §§, ¶¶, ##, etc.
const SYMBOLS = '*†‡§¶#'.split('');

type FootnoteRef = {
	count: number;
	glyph: string;
	id: string;
	idx: number;
	text: string;
};

@Injectable({
	providedIn: 'root',
})
export class FootnoteService {
	#footnotes = signal(new Map<string, FootnoteRef>(), { equal: () => false });

	footnotes = computed(
		() => {
			return [...this.#footnotes().values()];
		},
		{
			equal: () => false,
		},
	);

	footnotes$ = toObservable(this.footnotes);

	decrementFootnoteRef(text: string): void {
		const footnote = this.#footnotes().get(text);
		if (!footnote) {
			console.warn(
				`Attempted to decrement footnote ref for "${text}", but it does not exist.`,
			);
			return;
		}
		const refCount = footnote.count;
		if (refCount > 1) {
			footnote.count = refCount - 1;
		} else {
			this.#footnotes().delete(text);
		}
	}

	getFootnoteRef(text: string): FootnoteRef {
		if (!this.#footnotes().has(text)) {
			const idx = this.#footnotes().size;
			const newRef: FootnoteRef = {
				count: 1,
				glyph: this.getFootnoteSymbol(idx),
				id: `footnote-${idx}`,
				idx,
				text,
			};

			this.#footnotes().set(text, newRef);
		}
		const footnote = this.#footnotes().get(text);
		if (!footnote) {
			throw new Error(
				`Footnote ref for "${text}" was not found after creation.`,
			);
		}
		return footnote;
	}

	getFootnoteSymbol(index: number): string {
		if (index < SYMBOLS.length) {
			return SYMBOLS[index];
		}
		// For more than SYMBOLS.length, we can repeat symbols or use numbers
		const symbolIndex = index % SYMBOLS.length;
		const repeatCount = Math.floor(index / SYMBOLS.length) + 1;
		return SYMBOLS[symbolIndex].repeat(repeatCount);
	}
}
