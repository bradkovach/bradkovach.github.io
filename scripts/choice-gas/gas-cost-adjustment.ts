import cheerio from 'cheerio';
import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/data.current';
import { MarketOffer } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

const url =
	'https://www.blackhillsenergy.com/services/choice-gas-program/wyoming-choice-gas-customers/black-hills-wyoming-gas-llc-utility-gas';

export function run(): Promise<MarketOffer[]> {
	return fetch(url)
		.then((response) => response.text())
		.then((text) => {
			const $ = cheerio.load(text);
			return $;
		})
		.then(($) =>
			$(
				'.article--content__description > table:nth-of-type(1) > tbody:nth-of-type(1) > tr:nth-of-type(1)',
			)
				.toArray()
				.map((tr, rowIdx) => {
					const tds = $(tr).find('td:not(colspan)');
					const [, priceText] = tds
						.toArray()
						.slice(-3)
						.map((td) => $(td).text().trim());

					return Number(priceText);
				})
				.shift(),
		)
		.then((price) => {
			if (!price) {
				throw new Error('Failed to parse price: ' + price);
			}
			return [
				{
					type: 'market',
					market: Market.GCA,
					rate: price,
				} as MarketOffer,
			];
		});
}

// run();
