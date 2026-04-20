// uncle frank's prices are hard-coded in a JS

import * as cheerio from 'cheerio';

import type { AnyOffer } from '../../projects/choice-gas/src/app/schema/offer.z';

import { writeCheerioRoot } from './util';

export const run = (): Promise<AnyOffer[]> =>
	fetch('https://unclefrankenergy.com/natural-gas-quote/', {
		credentials: 'omit',
		headers: {
			Accept: 'text/html,application/json',
			'Accept-Language': 'en-US,en;q=0.9',
			Priority: 'u=0, i',
			'Sec-Fetch-Dest': 'document',
			'Sec-Fetch-Mode': 'navigate',
			'Sec-Fetch-Site': 'same-origin',
			'Sec-Fetch-User': '?1',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent':
				'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0',
		},
		method: 'GET',
		mode: 'cors',
		referrer: 'https://unclefrankenergy.com/choice-gas-program/',
	})
		.then((r) => {
			console.log(`Response status: ${r.status} ${r.statusText}`);
			if (!r.ok) {
				throw new Error(`Network response was not ok: ${r.statusText}`);
			}
			return r.text();
		})
		// .then(formatHtml())
		// .then(writeTo(new URL('./uncle-frank-energy.html', import.meta.url)))
		.then((html) => cheerio.load(html))
		.then(
			writeCheerioRoot(
				new URL('./uncle-frank-energy.html', import.meta.url),
			),
		)
		.then(($) => {
			const results: AnyOffer[] = [];

			console.log($.html());

			return results;
		});
