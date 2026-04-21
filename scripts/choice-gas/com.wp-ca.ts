import * as cheerio from 'cheerio';

import type { AnyOffer } from '../../projects/choice-gas/src/app/schema/offer.z';

import { Market } from '../../projects/choice-gas/src/app/data/Market';
import { BestOffer } from '../../projects/choice-gas/src/app/schema/best-offer.z';
import { BlendedOffer } from '../../projects/choice-gas/src/app/schema/blended-offer.z';
import { FixedPerThermOffer } from '../../projects/choice-gas/src/app/schema/fixed-per-therm-offer.z';
import { MarketOffer } from '../../projects/choice-gas/src/app/schema/market-offer.z';

type ExtractFn<T extends AnyOffer> = (
	term: number,
	name: string,
	priceText: string,
	confirmationCode: string,
) => T;
const url = 'https://www.wp-ca.com/pricing/';
const extractors: Record<string, ExtractFn<AnyOffer>> = {
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

		return BlendedOffer.parse({
			confirmationCode,
			id: `blended-${term}`,
			name,
			offers: [
				[
					1,
					{
						rate: fptRate,
						type: 'fpt',
					},
				],
				[
					1,
					{
						market: Market.CIG,
						rate: cigRate,
						type: 'market',
					},
				],
			],
			term,
			type: 'blended',
		});
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

		return FixedPerThermOffer.parse({
			confirmationCode,
			id: `fixed-${term}`,
			name,
			rate,
			term,
			type: 'fpt',
		});
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

		return BestOffer.parse({
			confirmationCode,
			id: `best-${term}`,
			name,
			offers: [
				{
					rate: fpt,
					type: 'fpt',
				},
				{
					market: Market.CIG,
					rate: cig,
					type: 'market',
				},
			],
			term,

			type: 'best',
		});
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

		return MarketOffer.parse({
			confirmationCode,
			id: `market-${term}`,
			market: Market.CIG,
			name,
			rate,
			term,
			type: 'market',
		});
	},
};
export const run = (): Promise<AnyOffer[]> =>
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
