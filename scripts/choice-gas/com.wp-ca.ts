import type {
	BestOffer,
	BlendedOffer,
	FixedPerThermOffer,
	MarketOffer,
	Offer,
	OfferBase,
} from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

import * as cheerio from 'cheerio';

import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/Market';

type ExtractFn<T extends Offer> = (
	term: number,
	name: string,
	priceText: string,
	confirmationCode: string,
) => T;
const url = 'https://www.wp-ca.com/pricing/';
const extractors: Record<string, ExtractFn<Offer>> = {
	Blended: (
		term: number,
		name: string,
		priceText: string,
		confirmationCode: string,
	) => {
		// 'CIG+ $0.125 / $0.595'
		const rx = /^CIG\+\s*\$(\d+\.\d+)\s*\/\s*\$(\d+\.\d+)$/;
		const matches = priceText.match(rx);
		if (!matches) {
			throw new Error(`Failed to parse Blended price: '${priceText}'`);
		}
		const [cigRate, fptRate] = matches.slice(1).map(parseFloat);

		const offer: BlendedOffer & OfferBase = {
			confirmationCode,
			id: `blended-${term}`,
			name,
			offers: [
				[
					1,
					{
						confirmationCode,
						rate: fptRate,
						type: 'fpt',
					} as FixedPerThermOffer,
				],
				[
					1,
					{
						confirmationCode,
						market: Market.CIG,
						rate: cigRate,
						type: 'market',
					} as MarketOffer,
				],
			],
			term,
			type: 'blended',
		};

		return offer;
	},
	Fixed: (
		term: number,
		name: string,
		priceText: string,
		confirmationCode: string,
	) => {
		const rx = /^\$(\d+\.\d+)$/;
		const matches = priceText.match(rx);
		if (!matches) {
			throw new Error(`Failed to parse Fixed price: '${priceText}'`);
		}
		const rate = parseFloat(matches[1]);

		const offer: FixedPerThermOffer & OfferBase = {
			confirmationCode,
			id: `fixed-${term}`,
			name,
			rate,
			term,
			type: 'fpt',
		};

		return offer;
	},
	'Index With A Cap': (
		term: number,
		name: string,
		priceText: string,
		confirmationCode: string,
	) => {
		// 'CIG+ $0.189  /  $0.789'
		const rx = /^CIG\+\s*\$(\d+\.\d+)\s*\/\s*\$(\d+\.\d+)$/;
		const matches = priceText.match(rx);
		if (!matches) {
			throw new Error(
				`Failed to parse Index With A Cap price: '${priceText}'`,
			);
		}
		const [cig, fpt] = matches.slice(1).map(parseFloat);

		const offer: BestOffer & OfferBase = {
			confirmationCode,
			id: `best-${term}`,
			name,
			offers: [
				{
					rate: fpt,
					type: 'fpt',
				} as FixedPerThermOffer,
				{
					market: Market.CIG,
					rate: cig,
					type: 'market',
				} as MarketOffer,
			],
			term,

			type: 'best',
		};

		return offer;
	},
	'Market Index': (
		term: number,
		name: string,
		priceText: string,
		confirmationCode: string,
	) => {
		// 'CIG+ $0.000'
		const rx = /CIG\+\s*\$(\d+\.\d+)/;
		const matches = priceText.match(rx);
		if (!matches) {
			throw new Error(
				`Failed to parse Market Index price: '${priceText}'`,
			);
		}
		const rate = parseFloat(matches[1]);

		const offer: MarketOffer & OfferBase = {
			confirmationCode,
			id: `market-${term}`,
			market: Market.CIG,
			name,
			rate,
			term,
			type: 'market',
		};

		return offer;
	},
};
export const run = (): Promise<Offer[]> =>
	fetch(url)
		.then((response) => response.text())
		.then((text) => cheerio.load(text))
		.then(($) =>
			$('#casper-section tbody tr')
				.toArray()
				.map((tr, rowIdx) => {
					const tds = $(tr).find('td:not(colspan)');
					const term = Math.floor(rowIdx / 4) + 1;
					const [name, priceText, code] = tds
						.toArray()
						.slice(-3)
						.map((td) => $(td).text().trim());

					const extractor = extractors[name];
					if (extractor) {
						return extractor(term, name, priceText, code);
					} else {
						throw new Error(`Unknown offer type: ${name}`);
					}
				}),
		);
