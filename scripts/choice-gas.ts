import chalk from 'chalk';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { AnyOffer } from '../projects/bradkovach.github.io/src/app/routes/choice-gas/schema/offer.z';

const drivers = [
	// NOT WORKING
	// 'com.unclefrankenergy',

	// WORKING
	// 'com.archerenergy', // 2026-03-30 rate not published yet
	// 'com.choicegas',
	// 'com.choosebhes', // pricing available 2026-04-02
	// 'com.legacynaturalgas.www', // 2026-04-02
	// 'com.symmetryenergy', // closed until 4/2
	// 'com.vistaenergymarketing', // "Pricing is no longer availalble for this account."
	// 'com.woodriverenergy', // no pricing data available 3/30
	// 'com.wp-ca', // 3/30 no prices in table
	'org.wyomingcommunitygas',
];

export type OfferDriver = { run: () => Promise<AnyOffer[]> };

// naive implementation of findUp
export const findUp = (filename: string, startDir: string = process.cwd()) => {
	// security first
	// if file or startDir includes .., throw error
	if (filename.includes('..') || startDir.includes('..')) {
		throw new Error('Invalid path');
	}

	while (startDir !== '/') {
		const filePath = path.join(startDir, filename);
		if (existsSync(filePath)) {
			return filePath;
		}
		startDir = path.dirname(startDir);
	}
};

type IdentityFn<T> = (x: T) => T;

const identity: IdentityFn<unknown> = (x) => x;

type StringsFunction = (w: Strings) => string;

class Strings {
	bold(...topicsOrFunctions: Array<string | StringsFunction>) {
		return this.#curry(chalk.bold.whiteBright, ...topicsOrFunctions);
	}

	bytes(n: number) {
		return `${n} bytes`;
	}

	cyan(...topicsOrFunctions: Array<string | StringsFunction>) {
		return this.#curry(chalk.cyan, ...topicsOrFunctions);
	}

	duration(start: number, end: number = Date.now()) {
		const ms = end - start;
		return `${ms}ms`;
	}

	eventually(process: string) {
		return `... ${process}`;
	}

	green(...topicsOrFunctions: Array<string | StringsFunction>) {
		return this.#curry(chalk.green, ...topicsOrFunctions);
	}

	inflect(count: number, singular: string, plural: string) {
		const word = count === 1 ? singular : plural;
		const str = `${count} ${word}`;
		return count > 0 ? chalk.bold.whiteBright(str) : chalk.dim(str);
	}
	json(obj: unknown, indent: number = 2) {
		return JSON.stringify(obj, null, indent);
	}

	magenta(...topicsOrFunctions: Array<string | StringsFunction>) {
		return this.#curry(chalk.magenta, ...topicsOrFunctions);
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

	red(...topicsOrFunctions: Array<string | StringsFunction>) {
		return this.#curry(chalk.red, ...topicsOrFunctions);
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

	yellow(...topicsOrFunctions: Array<string | StringsFunction>) {
		return this.#curry(chalk.yellow, ...topicsOrFunctions);
	}

	#curry(
		brush: (s: string) => string,
		...topicsOrFunctions: Array<string | StringsFunction>
	) {
		const toPrint = topicsOrFunctions
			.map((t) => (typeof t === 'string' ? t : t(this)))
			.join(' ');
		return brush(toPrint);
	}
}

class Chalks {
	#strings = new Strings();
}

class Output {
	#strings = new Strings();

	log(...topicsOrFunctions: Array<string | StringsFunction>) {
		const toPrint = topicsOrFunctions
			.map((t) => (typeof t === 'string' ? t : t(this.#strings)))
			.join(' ');
		console.log(toPrint);

		return this;
	}
}

function run() {
	const output = new Output();

	const overallStart = Date.now();
	const angularJsonPath = findUp('angular.json');
	if (!angularJsonPath) {
		throw new Error('angular.json not found');
	}

	const vendorDir = new URL(
		'./projects/bradkovach.github.io/src/app/routes/choice-gas/data/vendors/json/',
		pathToFileURL(angularJsonPath),
	);

	return Promise.all(
		drivers.map(
			(
				driver,
				_idx,
				_drivers,
				outputPath = new URL(`./${driver}.json`, vendorDir),
				start = Date.now(),
			) =>
				import(`./choice-gas/${driver}`)
					.then(({ run }: OfferDriver) => run())
					.catch(<E extends Error>(e: E) => {
						output
							.log('Error running', (o) => o.yellow(driver))
							.log('    ', (o) => o.red(e.message));
						return [];
					})
					.then((offers, json = JSON.stringify(offers, null, 2)) =>
						writeFile(outputPath, json, 'utf-8').then(() => {
							output
								.log(
									'... wrote',
									(o) =>
										o.inflect(
											offers.length,
											'offer',
											'offers',
										),
									(o) => o.magenta('in', o.duration(start)),
									(o) => o.parens(o.bytes(json.length)),
								)
								.log('to', (o) => o.relative(outputPath));
						}),
					),
		),
	).then(() => Date.now() - overallStart);
}

run()
	.then((timeElapsed) => {
		console.log('Refreshed all data in', timeElapsed, 'ms');
	})
	.catch((e) => {
		console.error('Error running all drivers:', e);
	});
