import cheerio from 'cheerio';
import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/data.current';
import {
	BlendedOffer,
	FixedPerThermOffer,
	MarketOffer,
	Offer,
	OfferBase,
} from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

const url = 'https://www.archerenergy.com/black-hills-casper.php';

export function run(): Promise<(OfferBase & Offer)[]> {
	return fetch(url)
		.then((response) => response.text())
		.then((text) => {
			const $ = cheerio.load(text);
			return $;
		})
		.then(($) => {
			const planNames = $(
				'.plan-table > tbody > tr > td[rowspan=2]:nth-of-type(1)',
			)
				.toArray()
				.map((th) => $(th).text().trim());
			return $('.plan-table > tbody > tr')
				.slice(0, -1)
				.map((rowIdx, tr) => {
					const tds = $(tr).find('td');
					const [nYr, priceText, confirmationCode] = tds
						.toArray()
						.slice(-3)
						.map((td) => $(td).text().trim());

					const plan = planNames[Math.floor(rowIdx / 2)];

					const term = Number(nYr[0]);

					switch (plan) {
						case 'RATE LOCK': {
							const offer: OfferBase & FixedPerThermOffer = {
								type: 'fpt',
								id: `ratelock-${term}`,
								name: 'Rate Lock',
								term,
								rate: Number(priceText.slice(1)),
								confirmationCode,
							};
							return offer;
						}
						case 'PASS THRU': {
							const offer: OfferBase & MarketOffer = {
								type: 'market',
								id: `pass-thru-${term}`,
								name: 'Pass Thru',
								term,
								market: Market.CIG,
								rate: Number(priceText.slice(1)),
								confirmationCode,
							};
							return offer;
						}
						case 'ARCHER PRO': {
							const rx =
								/^\$+(\d+\.\d+)\s*\/\s*CIG\+\s*\$+(\d+\.\d+)$/;
							const matches = priceText.match(rx);
							if (!matches) {
								console.error(`No match for ${priceText}`);
								return null;
							}
							const [fptRate, mktRate] = matches
								.slice(1)
								.map(Number);
							const offer: OfferBase & BlendedOffer = {
								type: 'blended',
								id: `archer-pro-${term}`,
								name: 'Archer Pro',
								term,
								offers: [
									[
										1,
										{
											rate: fptRate,
											type: 'fpt',
										} as FixedPerThermOffer,
									],
									[
										2,
										{
											rate: mktRate,
											type: 'market',
											market: Market.CIG,
										} as MarketOffer,
									],
								],
								confirmationCode,
							};
							return offer;
						}
						case 'GREENGAS': {
							const offer: OfferBase & FixedPerThermOffer = {
								type: 'fpt',
								id: `green-gas-${term}`,
								name: 'Green Gas',
								term,
								rate: Number(priceText.slice(1)),
								confirmationCode,
							};
							return offer;
						}
						default:
							throw new Error(`Unknown plan: ${plan}`);
					}
				})
				.toArray();
		});
}

run();
