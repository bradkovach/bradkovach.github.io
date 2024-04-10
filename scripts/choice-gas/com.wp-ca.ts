import cheerio from 'cheerio';
import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/data.current';
import {
	BestOffer,
	BlendedOffer,
	FixedPerThermOffer,
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
export function run(): Promise<(OfferBase & Offer)[]> {
	const url = 'https://www.wp-ca.com/pricing/';
	const extractors: Record<string, ExtractFn<Offer>> = {
		Fixed: (
			term: number,
			name: string,
			priceText: string,
			confirmationCode: string,
		) => {
			const rx = /^\$(\d+\.\d+)$/;
			const matches = priceText.match(rx);
			if (!matches) {
				throw new Error(`Failed to parse Fixed price: ${priceText}`);
			}
			const rate = parseFloat(matches[1]);

			const offer: FixedPerThermOffer & OfferBase = {
				type: 'fpt',
				id: `fixed-${term}`,
				name,
				term,
				rate,
				confirmationCode,
			};

			return offer;
		},
		'Market Index': (
			term: number,
			name: string,
			priceText: string,
			confirmationCode: string,
		) => {
			const rx = /^CIG\s*\+\$(\d+\.\d+)$/;
			const matches = priceText.match(rx);
			if (!matches) {
				throw new Error(
					`Failed to parse Market Index price: ${priceText}`,
				);
			}
			const rate = parseFloat(matches[1]);

			const offer: MarketOffer & OfferBase = {
				type: 'market',
				id: `market-${term}`,
				name,
				term,
				market: Market.CIG,
				rate,
				confirmationCode,
			};

			return offer;
		},
		Blended: (
			term: number,
			name: string,
			priceText: string,
			confirmationCode: string,
		) => {
			const rx = /^\$(\d+\.\d+)\s*\/\s*CIG\+\s*\$(\d+\.\d+)$/;
			const matches = priceText.match(rx);
			if (!matches) {
				throw new Error(`Failed to parse Blended price: ${priceText}`);
			}
			const [fpt, fpm] = matches.slice(1).map(parseFloat);

			const offer: BlendedOffer & OfferBase = {
				type: 'blended',
				id: `blended-${term}`,
				name,
				term,
				confirmationCode,
				offers: [
					[
						1,
						{
							type: 'fpt',
							rate: fpt,
							confirmationCode,
						} as FixedPerThermOffer,
					],
					[
						1,
						{
							type: 'market',
							market: Market.CIG,
							rate: fpm,
							confirmationCode,
						} as MarketOffer,
					],
				],
			};

			return offer;
		},
		'Index With A Cap': (
			term: number,
			name: string,
			priceText: string,
			confirmationCode: string,
		) => {
			const rx = /^\$(\d+\.\d+)\s*\/\s*CIG\+\s*\$(\d+\.\d+)$/;
			const matches = priceText.match(rx);
			if (!matches) {
				throw new Error(
					`Failed to parse Index With A Cap price: '${priceText}'`,
				);
			}
			const [fpt, cig] = matches.slice(1).map(parseFloat);

			const offer: BestOffer & OfferBase = {
				type: 'best',
				id: `best-${term}`,
				name,
				term,
				offers: [
					{
						type: 'fpt',
						rate: fpt,
					} as FixedPerThermOffer,
					{
						type: 'market',
						market: Market.CIG,
						rate: cig,
					} as MarketOffer,
				],

				confirmationCode,
			};

			return offer;
		},
	};
	return fetch(url)
		.then((response) => response.text())
		.then((text) => {
			const $ = cheerio.load(text);
			return $;
		})
		.then(($) =>
			$('#casper-section tbody tr')
				.map((rowIdx, tr) => {
					const tds = $(tr).find('td:not(colspan)');
					const term = Math.floor(rowIdx / 4) + 1;
					const [name, priceText, code] = tds
						.toArray()
						.slice(-3)
						.map((td) => $(td).text().trim());

					const extractor = extractors[name];
					if (extractor) {
						return extractor(term, name, priceText, code);
					}
				})
				.toArray(),
		);
}
