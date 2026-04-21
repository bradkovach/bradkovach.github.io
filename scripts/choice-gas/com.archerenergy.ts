import * as cheerio from 'cheerio';

import type { AnyOffer } from '../../projects/choice-gas/src/app/schema/offer.z';

import { Market } from '../../projects/choice-gas/src/app/data/Market';
import { BlendedOffer } from '../../projects/choice-gas/src/app/schema/blended-offer.z';
import { FixedPerMonthOffer } from '../../projects/choice-gas/src/app/schema/fixed-per-month.z';
import { FixedPerThermOffer } from '../../projects/choice-gas/src/app/schema/fixed-per-therm-offer.z';
import { MarketOffer } from '../../projects/choice-gas/src/app/schema/market-offer.z';

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
							return [
								BlendedOffer.parse({
									confirmationCode,
									id: `archer-pro-${term}`,
									name: plan,
									offers: [
										[
											1,
											{
												rate: fptRate,
												type: 'fpt',
											},
										],
										[
											2,
											{
												market: Market.CIG,
												rate: mktRate,
												type: 'market',
											},
										],
									],
									term,
									type: 'blended',
								}),
							];
						}
						case 'FlatBill+Cashback': {
							// fixed per month
							const maybeRate = Number(
								priceText
									.replace(/^\D*/, '')
									.replace(/\D*$/, ''),
							);

							return [
								FixedPerMonthOffer.parse({
									id: `flatbill-cashback-fpm-${term}`,
									name: plan,
									rate: isNaN(maybeRate)
										? undefined
										: maybeRate,
									term,
									type: 'fpm',
								}),
							];
						}
						case 'GreenGas': {
							return [
								FixedPerThermOffer.parse({
									confirmationCode,
									id: `green-gas-${term}`,
									name: plan,
									rate: Number(priceText.slice(1)),
									term,
									type: 'fpt',
								}),
							];
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
							return [
								MarketOffer.parse({
									confirmationCode,
									id: `pass-thru-${term}`,
									market: Market.CIG,
									name: plan,
									rate: mktRate,
									term,
									type: 'market',
								}),
							];
						}
						case 'RateLock': {
							return [
								FixedPerThermOffer.parse({
									confirmationCode,
									id: `ratelock-${term}`,
									name: plan,
									rate: Number(priceText.slice(1)),
									term,
									type: 'fpt',
								}),
							];
						}
						default: {
							throw Error(
								`com.archerenergy: Unknown plan type: ${plan}`,
							);
						}
					}
				});
		});
