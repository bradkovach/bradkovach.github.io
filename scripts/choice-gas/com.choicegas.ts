import cheerio from 'cheerio';
import fs from 'node:fs';
import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/data.current';
import {
	MarketOffer,
	Offer,
	OfferBase,
} from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

type ExtractFn<T extends Offer> = (
	term: number,
	name: string,
	priceText: string,
	confirmationCode: string,
) => T;
function run() {
	const url =
		'https://www.blackhillsenergy.com/services/choice-gas-program/wyoming-choice-gas-customers/black-hills-wyoming-gas-llc-utility-gas';
	fetch(url)
		.then((response) => response.text())
		.then((text) => {
			const $ = cheerio.load(text);
			return $;
		})
		.then(($) =>
			$(
				'.article--content__description > table:nth-of-type(1) > tbody:nth-of-type(1) > tr',
			).map((rowIdx, tr) => {
				const tds = $(tr).find('td:not(colspan)');
				const term = Math.floor(rowIdx / 4) + 1;
				const [division, priceText, confirmationCode] = tds
					.toArray()
					.slice(-3)
					.map((td) => $(td).text().trim());

				const offer: OfferBase & MarketOffer = {
					type: 'market',
					id: `gca-${division}-${term}`,
					name: 'Gas Cost Adjustment - ' + division + ' Division',
					term,
					market: Market.GCA,
					rate: 0,
					confirmationCode,
				};

				return offer;
			}),
		)
		.then((offers) => {
			// write to json file at path
			const path =
				'projects/bradkovach.github.io/src/app/routes/choice-gas/data/vendors/json/com.choicegas.json';
			const json = JSON.stringify(offers.toArray(), null, 2);
			fs.writeFileSync(path, json, 'utf-8');
		});
}

run();
