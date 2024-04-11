import { writeFile } from 'fs/promises';
import { Offer } from '../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

const drivers = [
	'com.vistaenergymarketing',
	'com.symmetryenergy',
	'com.choosebhes',
	'com.woodriverenergy',
	'com.archerenergy',
	// 'com.unclefrankenergy',
	'com.wp-ca',
	'org.wyomingcommunitygas',
	'com.legacynaturalgas.www',
	'com.choicegas',
];

type OfferDriver = { run: () => Promise<Offer[]> };

function run() {
	const overallStart = Date.now();
	Promise.all(
		drivers.map((driver) => {
			const path = `projects/bradkovach.github.io/src/app/routes/choice-gas/data/vendors/json/${driver}.json`;
			const start = Date.now();
			return import(`./choice-gas/${driver}`)
				.then(({ run }: OfferDriver) => run())
				.catch((e) => {
					console.error(`Error running ${driver}:`, e);
					return [];
				})
				.then((o) =>
					writeFile(path, JSON.stringify(o, null, 2), 'utf-8'),
				)
				.then(() =>
					console.log(`... wrote ${path} in ${Date.now() - start}ms`),
				);
		}),
	).then(() => {
		console.log('Refreshed all data in', Date.now() - overallStart, 'ms');
	});
}

run();
