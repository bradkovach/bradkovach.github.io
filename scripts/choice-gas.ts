import type { Offer } from '../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path/posix';

const drivers = [
	// NOT WORKING
	// 'com.vistaenergymarketing', //
	// 'com.unclefrankenergy',

	// WORKING
	'com.symmetryenergy',
	'com.choosebhes',
	'com.woodriverenergy',
	'com.archerenergy',
	'com.wp-ca',
	'org.wyomingcommunitygas',
	'com.legacynaturalgas.www',
	'com.choicegas',
];

export type OfferDriver = { run: () => Promise<Offer[]> };

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

function run() {
	const overallStart = Date.now();
	const angularJsonPath = findUp('angular.json');
	if (!angularJsonPath) {
		throw new Error('angular.json not found');
	}
	// const rootDir = path.dirname(angularJsonPath);
	return Promise.all(
		drivers.map((driver) => {
			const path = `projects/bradkovach.github.io/src/app/routes/choice-gas/data/vendors/json/${driver}.json`;
			const start = Date.now();
			return import(`./choice-gas/${driver}`)
				.then(({ run }: OfferDriver) => run())
				.catch(<E extends Error>(e: E) => {
					console.error(`Error running ${driver}:`, e.message);
					return [];
				})
				.then((o) => {
					const json = JSON.stringify(o, null, 2);
					return writeFile(path, json, 'utf-8').then(() => {
						console.log(
							`... wrote ${o.length} offers to ${path} in ${
								Date.now() - start
							}ms (${json.length} bytes)`,
						);
					});
				});
		}),
	).then(() => Date.now() - overallStart);
}

run()
	.then((timeElapsed) => {
		console.log('Refreshed all data in', timeElapsed, 'ms');
	})
	.catch((e) => {
		console.error('Error running all drivers:', e);
	});
