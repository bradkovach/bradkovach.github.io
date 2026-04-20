import type { IdentityFn, StringsFunction } from './choice-gas';

import { identity } from './choice-gas/util';
import { Strings } from './Strings';

export class Output {
	#strings = new Strings();

	append(...topicsOrFunctions: Array<string | StringsFunction>) {
		const toPrint = topicsOrFunctions
			.map((t) => (typeof t === 'string' ? t : t(this.#strings)))
			.join(' ');
		process.stdout.write(toPrint);

		return this;
	}

	asTap<T>(): IdentityFn<T> {
		return identity;
	}

	log(...topicsOrFunctions: Array<string | StringsFunction>) {
		const toPrint = topicsOrFunctions
			.map((t) => (typeof t === 'string' ? t : t(this.#strings)))
			.join(' ');
		console.log(toPrint);

		return this;
	}

	returning<T>(value: T) {
		return value;
	}
}
