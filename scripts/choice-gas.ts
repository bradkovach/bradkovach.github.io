import chalk from 'chalk';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { AnyOffer } from '../projects/choice-gas/src/app/schema/offer.z';

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
	'com.woodriverenergy', // no pricing data available 3/30
	// 'com.wp-ca', // 3/30 no prices in table
	// 'org.wyomingcommunitygas',
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

const identity = <T>(x: T): T => x;

type StringsFunction = (w: Strings) => string;

class Strings {
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

// class Chalks {
// 	#strings = new Strings();
// }

class Output {
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

const output = new Output();

const saveOffers =
	(
		driver: string,
		outputPath: URL,
		overallStart: number,
		driverStart: number,
	) =>
	(
		{ errors, offers }: { errors: Error[]; offers: AnyOffer[] },
		json: string = JSON.stringify(
			offers.sort((a, b) => a.type.localeCompare(b.type)),
			null,
			2,
		),
		saveStart: number = Date.now(),
	): Promise<void> =>
		writeFile(outputPath, json, 'utf-8')
			.catch((e) => ({
				errors: [...errors, e],
				offers,
			}))
			.then(() => {
				output.log((o) => o.chalk.yellow(driver));

				if (errors.length) {
					output.log(
						(o) => o.indent(1),
						(o) => o.chalk.bold.red('ERROR'),
						(o) =>
							o
								.addMargin(
									errors
										.map(
											(e) =>
												e.stack ??
												e.message ??
												'Unknown error',
										)
										.join('\n\n'),
									3,
								)
								.trimStart(),
					);
				}

				output
					.log(
						(o) => o.indent(1),
						'Fetched',
						(o) =>
							o.chalk.blue(
								o.inflect(offers.length, 'offer', 'offers'),
							),
						'in',
						(o) => o.chalk.green(o.duration(driverStart)),
					)
					.log(
						(o) => o.indent(1),
						'Wrote',
						(o) => o.chalk.blue(o.bytes(json.length)),
						'in',
						(o) => o.chalk.green(o.duration(saveStart)),
						'to',
						(o) => o.relative(outputPath),
					)
					.log(
						(o) => o.indent(1),
						driver,
						'took',
						(o) => o.chalk.green(o.duration(overallStart)),
					);
			});

function run() {
	const overallStart = Date.now();
	const angularJsonPath = findUp('angular.json');
	if (!angularJsonPath) {
		throw new Error('angular.json not found');
	}

	const vendorDir = new URL(
		'./projects/choice-gas/src/app/data/vendors/json/',
		pathToFileURL(angularJsonPath),
	);

	return Promise.all(
		drivers.map(
			(
				driver,
				_idx,
				_drivers,
				outputPath = new URL(`./${driver}.json`, vendorDir),
				driverStart = Date.now(),
			) =>
				import(`./choice-gas/${driver}`)
					.then(({ run }: OfferDriver) => run())
					.then((offers) => ({ errors: [], offers }))
					.catch(
						<E extends Error>(e: E) =>
							({ errors: [e], offers: [] }) as {
								errors: Error[];
								offers: AnyOffer[];
							},
					)
					.then(
						saveOffers(
							driver,
							outputPath,
							overallStart,
							driverStart,
						),
					),
		),
	).then((result) => {
		output.log(
			'Refreshed',
			(o) => o.inflect(result.length, 'driver', 'drivers'),
			'in',
			(o) => o.chalk.green(o.duration(overallStart)),
		);

		return result;
	});
}

run().catch((e) => {
	console.error('Error running all drivers:', e);
});
