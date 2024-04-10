import cheerio from 'cheerio';
import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/data.current';
import {
	MarketOffer,
	OfferBase,
} from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

const url =
	'https://www.blackhillsenergy.com/services/choice-gas-program/wyoming-choice-gas-customers/black-hills-wyoming-gas-llc-utility-gas';

export function run(): Promise<(OfferBase & MarketOffer)[]> {
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
				.map((rowIdx, tr): OfferBase & MarketOffer => {
					const tds = $(tr).find('td:not(colspan)');
					const term = Math.floor(rowIdx / 4) + 1;
					const [division, priceText, confirmationCode] = tds
						.toArray()
						.slice(-3)
						.map((td) => $(td).text().trim());

					return {
						type: 'market',
						id: `gca-${division}-${term}`,
						name: `Gas Cost Adjustment - $${Number(
							priceText,
						).toFixed(4)} - ${division} Division`,
						term,
						market: Market.GCA,
						rate: 0,
						confirmationCode,
					};
				})
				.toArray(),
		);
}

// run();
