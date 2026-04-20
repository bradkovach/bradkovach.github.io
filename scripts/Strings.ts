import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

import type { StringsFunction } from './choice-gas';

export class Strings {
	get chalk() {
		return chalk;
	}

	addMargin(string: string, spaces: number = 2) {
		const margin = ' '.repeat(spaces);
		return string
			.split('\n')
			.map((line) => margin + line)
			.join('\n');
	}

	bytes(n: number) {
		return `${n} bytes`;
	}
	duration(start: number, end: number = Date.now()) {
		const ms = end - start;
		return `${ms}ms`;
	}

	eventually(process: string) {
		return `... ${process}`;
	}

	indent(level: number = 1, char: string = '  ') {
		return char.repeat(level);
	}

	inflect(count: number, singular: string, plural: string) {
		const word = count === 1 ? singular : plural;
		return `${count} ${word}`;
	}

	join(char: string, ...topicsOrFunctions: Array<string | StringsFunction>) {
		const toPrint = topicsOrFunctions
			.map((t) => (typeof t === 'string' ? t : t(this)))
			.join(char);
		return toPrint;
	}

	json(obj: unknown, indent: number = 2) {
		return JSON.stringify(obj, null, indent);
	}

	padStart(str: string, length: number) {
		return str.padStart(length);
	}

	parens(topicOrFunction: string | StringsFunction) {
		const toPrint =
			typeof topicOrFunction === 'string'
				? topicOrFunction
				: topicOrFunction(this);
		return chalk.dim(`(${toPrint})`);
	}

	path(pathLike: string) {
		const p = pathLike.split(path.sep).join(path.posix.sep);

		const segments = p
			.split('/')
			.filter((s) => s.length > 0)
			.map((segment, idx, segments) => {
				if (idx === segments.length - 1) {
					return chalk.bold.whiteBright(segment);
				}
				return segment;
			});

		return segments.join(chalk.bold.whiteBright('/'));
	}

	relative(to: string | URL, from: string | URL = process.cwd()) {
		const fromUrl = typeof from === 'string' ? from : fileURLToPath(from);
		const toUrl = typeof to === 'string' ? to : fileURLToPath(to);
		return this.path(path.relative(fromUrl, toUrl));
	}

	result(topic: string) {
		return `... ${topic}`;
	}

	url(u: string | URL) {
		const url = new URL(u);
		return url.toString();
	}
}
