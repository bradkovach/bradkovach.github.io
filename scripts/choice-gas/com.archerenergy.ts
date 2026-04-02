import * as cheerio from 'cheerio';

import type { BlendedOffer } from '../../projects/choice-gas/src/app/schema/blended-offer.z';
import type { FixedPerThermOffer } from '../../projects/choice-gas/src/app/schema/fixed-per-therm-offer.z';
import type { MarketOffer } from '../../projects/choice-gas/src/app/schema/market-offer.z';
import type { OfferBase } from '../../projects/choice-gas/src/app/schema/offer-base.z';
import type { AnyOffer } from '../../projects/choice-gas/src/app/schema/offer.z';

import { Market } from '../../projects/choice-gas/src/app/data/Market';

const url = 'https://www.archerenergy.com/shop/black-hills';

export const run = (): Promise<AnyOffer[]> =>
	fetch(url)
		.then((response) => response.text())
		.then((text) => cheerio.load(text))
		.then(($): AnyOffer[] => {
			const $accordionItem = $(
				'#blackHillsRates > .accordion-item:nth-of-type(1)',
			);
			return $accordionItem
				.find('.table > tbody > tr')
				.toArray()
				.flatMap((tr, rowIdx): AnyOffer[] => {
					const tds = $(tr).find('td');
					const [plan, priceText, confirmationCode] = tds
						.toArray()
						.slice(-3)
						.map((td) => $(td).text().trim());

					const term = rowIdx < 5 ? 1 : 2;

					switch (plan) {
						case 'ArcherPro': {
							const rx = /CIG\+\s*\$([\d.]+)\s*\/\s*\$([\d.]+)/;
							const matches = priceText.match(rx);
							if (!matches) {
								throw Error(
									`Unable to extract price from '${priceText}'`,
								);
							}
							const [mktRate, fptRate] = matches
								.slice(1)
								.map(Number);
							const offer: BlendedOffer = {
								confirmationCode,
								id: `archer-pro-${term}`,
								name: plan,
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
											market: Market.CIG,
											rate: mktRate,
											type: 'market',
										} as MarketOffer,
									],
								],
								term,
								type: 'blended',
							};
							return [offer];
						}
						case 'GreenGas': {
							const offer: FixedPerThermOffer & OfferBase = {
								confirmationCode,
								id: `green-gas-${term}`,
								name: plan,
								rate: Number(priceText.slice(1)),
								term,
								type: 'fpt',
							};
							return [offer];
						}
						case 'Pass-Through': {
							const rx = /CIG\+\s*\$([\d.]+)/;
							const matches = priceText.match(rx);
							if (!matches) {
								throw Error(
									`Unable to extract price from '${priceText}'`,
								);
							}
							const mktRate = Number(matches[1]);
							const offer: MarketOffer & OfferBase = {
								confirmationCode,
								id: `pass-thru-${term}`,
								market: Market.CIG,
								name: plan,
								rate: mktRate,
								term,
								type: 'market',
							};
							return [offer];
						}
						case 'RateLock': {
							const offer: FixedPerThermOffer & OfferBase = {
								confirmationCode,
								id: `ratelock-${term}`,
								name: plan,
								rate: Number(priceText.slice(1)),
								term,
								type: 'fpt',
							};
							return [offer];
						}
						default: {
							console.info('Skipping unknown plan type', plan);
						}
					}
					return [];
				});
		});
