import { existsSync } from 'fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'path';
import prettier from 'prettier';

import type { AnyOffer } from '../../projects/choice-gas/src/app/schema/offer.z';

import { output } from '../choice-gas';

export const formatHtml = (options?: prettier.Options) => (html: string) =>
	prettier.format(html, { ...options, parser: 'html' });

export const formatJson = (options?: prettier.Options) => (json: string) =>
	prettier.format(json, { ...options, parser: 'json' });

type WriteFileData = Parameters<typeof writeFile>[1];
type WriteFileOptions = Parameters<typeof writeFile>[2];

/*
.then((formattedHtml) => {
	const debugHtmlFile = new URL('./debug.html', import.meta.url);

	mkdirSync(dirname(fileURLToPath(debugHtmlFile)), {
		recursive: true,
	});
	writeFileSync(debugHtmlFile, formattedHtml, 'utf-8');
	console.log(`Formatted HTML written to ${debugHtmlFile}`);

	return formattedHtml;
})
			*/
export const writeTo =
	(dest: string | URL, options?: WriteFileOptions) =>
	<T extends WriteFileData>(
		value: T,
		url = new URL(dest),
		dir = dirname(fileURLToPath(url)),
	) =>
		mkdir(dir, {
			recursive: true,
		})
			.catch((err) => {
				console.error(`Error creating directory for ${dest}:`, err);
			})
			.then(() => writeFile(dest, value, options))
			.then(() => value);

export const writeCheerioRoot = (dest: string | URL) => ($: cheerio.Root) =>
	Promise.resolve($.html())
		.then(formatHtml())
		.then(writeTo(dest))
		.then(() => $);

export const responseToJson =
	<T>() =>
	(r: Response): Promise<T> => {
		if (!r.ok) {
			throw new Error(
				`${r.url}\n\tFailed to fetch account data: ${r.status} ${r.statusText}`,
			);
		}
		return r.json() as Promise<T>;
	};
export const saveOffers =
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
export const identity = <T>(x: T): T => x; // naive implementation of findUp

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
