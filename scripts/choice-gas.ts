import { writeFile } from 'fs/promises';
import { pathToFileURL } from 'node:url';

import type { AnyOffer } from '../projects/choice-gas/src/app/schema/offer.z';
import type { Strings } from './Strings';

import { findUp, saveOffers } from './choice-gas/util';
import { Output } from './Output';

const drivers: string[] = [
	// WORKING
	'com.archerenergy',
	'com.choicegas',
	'com.choosebhes',
	'com.vistaenergymarketing',
	'com.woodriverenergy',
	'com.wp-ca',
	'org.wyomingcommunitygas',
	'com.symmetryenergy',
	// ----- -----
	// Site seems to be down due to high traffic
	'com.legacynaturalgas.www', // 2026-04-02
	// NOT WORKING; hard-coded again
	// 'com.unclefrankenergy',
];

export type IdentityFn<T> = (x: T) => T;

export type OfferDriver = { run: () => Promise<AnyOffer[]> };

export type StringsFunction = (w: Strings) => string;

export const output = new Output();

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

	const vendorIdToOfferIds = new Map<string, Set<string>>();

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
					.then(({ errors, offers }) => {
						vendorIdToOfferIds.set(
							driver,
							new Set(offers.map((o) => o.id.toString())),
						);

						return { errors, offers };
					})
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

		// use vendorIdToOfferIds to generate routes.txt
		const routes: string[] = ['/', '/vendors', '/explorer'];
		const vendorOfferTuples: [string, string][] = [];
		for (const [vendorId, offerIds] of vendorIdToOfferIds.entries()) {
			routes.push(`/vendors/${vendorId}`);
			routes.push(`/vendors/${vendorId}/offers`);
			for (const offerId of offerIds) {
				routes.push(`/vendors/${vendorId}/offers/${offerId}`);
				vendorOfferTuples.push([vendorId, offerId.toString()]);
			}
		}

		const routesPath = new URL(
			'./projects/choice-gas/routes.txt',
			pathToFileURL(angularJsonPath),
		);
		const routesContent = routes.join('\n') + '\n';
		const tuplePath = new URL(
			'./projects/choice-gas/routes.json',
			pathToFileURL(angularJsonPath),
		);
		const tupleContent = JSON.stringify(vendorOfferTuples, null, 2);
		return writeFile(routesPath, routesContent, 'utf-8')
			.then(() => {
				output.log(
					'Wrote',
					(o) =>
						o.chalk.blue(
							o.inflect(routes.length, 'route', 'routes'),
						),
					'to',
					(o) => o.relative(routesPath),
				);
			})
			.then(() => writeFile(tuplePath, tupleContent, 'utf-8'))
			.then(() => {
				output.log(
					'Wrote',
					(o) =>
						o.chalk.blue(
							o.inflect(
								vendorOfferTuples.length,
								'vendor-offer tuple',
								'vendor-offer tuples',
							),
						),
					'to',
					(o) => o.relative(tuplePath),
				);
			});
	});
}

run().catch((e) => {
	console.error('Error running all drivers:', e);
});
