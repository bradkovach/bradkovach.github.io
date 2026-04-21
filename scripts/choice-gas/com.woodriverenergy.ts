import type { AnyOffer } from '../../projects/choice-gas/src/app/schema/offer.z';

import { getEnvAsync } from '../getEnvAsync';

export interface CreateQuoteResponse {
	balloted: boolean;
	premise_count: number;
	quote: Quote;
}

export interface Quote {
	account_num: number;
	bill_class: string;
	email: string;
	fixed_per_month: number[];
	fixed_per_therm: number[];
	id: number;
	index: number[];
	last_name: string;
	premise_num: number;
	pub_index: string;
	service_address: string;
	service_state: string;
	volume: number;
}

// q = ACCOUNT_NUMBER
const getOfferPage = (accountNumber: string) => {
	const url = new URL('https://choice.woodriverenergy.com/');
	url.searchParams.set('q', accountNumber);
	url.searchParams.set('utm_source', 'woodriver_website');
	url.searchParams.set('utm_medium', 'website');
	url.searchParams.set('utm_campaign', 'choice_2026');
	url.searchParams.set('utm_content', 'residential');
	return fetch(url.toString(), {
		credentials: 'include',
		headers: {
			Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'Accept-Language': 'en-US,en;q=0.9',
			Priority: 'u=0, i',
			'Sec-Fetch-Dest': 'document',
			'Sec-Fetch-Mode': 'navigate',
			'Sec-Fetch-Site': 'same-site',
			'Sec-Fetch-User': '?1',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent':
				'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0',
		},
		method: 'GET',
		mode: 'cors',
		referrer: 'https://www.woodriverenergy.com/',
	});
};

/*
 * WoodRiver Energy Price/Offer Driver
 * 2025: Simple JSON/REST api
 * 2026: No API, requires HTML parsing to extract offer data
 */

import * as cheerio from 'cheerio';

import { Market } from '../../projects/choice-gas/src/app/data/Market';
import { FixedPerMonthOffer } from '../../projects/choice-gas/src/app/schema/fixed-per-month.z';
import { FixedPerThermOffer } from '../../projects/choice-gas/src/app/schema/fixed-per-therm-offer.z';
import { MarketOffer } from '../../projects/choice-gas/src/app/schema/market-offer.z';

export const run = (): Promise<AnyOffer[]> =>
	getEnvAsync('BHE_PREMISE_ID')
		.catch(() => getEnvAsync('BHES_ACCOUNT_NUMBER'))
		.catch(() => {
			throw new Error('BHE_PREMISE_ID or BHES_ACCOUNT_NUMBER not set');
		})
		.then((premise_or_account_num) => getOfferPage(premise_or_account_num))
		.then((response) => response.text())
		// .then((html) => prettier.format(html, { parser: 'html' }))
		.then((formattedHtml) => cheerio.load(formattedHtml))
		.then(($) => {
			// article:has(header):has(section):has(footer)
			const article = $('article:has(header):has(section):has(footer)');

			const offers: AnyOffer[] = [];

			article.each((i, el) => {
				const section = $(el).find('section');
				const footer = $(el).find('footer');

				if (
					footer.text().toLowerCase() === "don't enroll this premise"
				) {
					// skip this article, because it's not the right one
					return;
				}

				// in the section, extract article
				const articles = section.find('article');
				if (articles.length === 0) {
					// skip this article, because it doesn't have any offers
					return;
				}

				// in each article, fieldset > label > input[type=radio].value = id
				articles.each((j, articleEl) => {
					// has the offer rate and term
					const fieldset = $(articleEl).find('> fieldset');
					const labels = fieldset.find('> label');
					if (labels.length === 0) {
						// skip this article, because it doesn't have any offers
						return;
					}

					// has the offer name
					const name = $(articleEl)
						.find('> div > section > h4')
						.text()
						.trim();

					labels.each((k, labelEl) => {
						const offerText = $(labelEl).text().trim();
						if (
							name.toLowerCase() ===
							'secure fixed price — fixed monthly bill'
						) {
							// x-year $00.00/month
							// term = x
							// rate = 0
							// type = 'fpm'
							const match = offerText.match(
								/(\d+)-year\s+\$(\d+(\.\d{2})?)\/month/i,
							);
							if (!match) {
								throw Error(
									`Could not parse offer text for Secure Fixed Price: '${offerText}'`,
								);
							}
							const [, termStr, rateStr] = match;
							const term = parseInt(termStr, 10);

							offers.push(
								FixedPerMonthOffer.parse({
									id: `fpm-${term}`,
									name,
									rate: parseFloat(rateStr),
									term,
									type: 'fpm',
								}),
							);
						} else if (
							name.toLowerCase() === 'guaranteed fixed price'
						) {
							// x-year $00.000/therm
							// term = x
							// rate = 0
							// type = 'fpt'
							const match = offerText.match(
								/(\d+)-year\s+\$(\d+(\.\d+)?)\/therm/i,
							);
							if (!match) {
								throw Error(
									`Could not parse offer text for Guaranteed Fixed Price: '${offerText}'`,
								);
							}
							const [, termStr, rateStr] = match;
							const term = parseInt(termStr, 10);
							const rate = parseFloat(rateStr);

							offers.push(
								FixedPerThermOffer.parse({
									id: `fpt-${term}`,
									name,
									rate,
									term,
									type: 'fpt',
								}),
							);
						} else if (name.toLowerCase() === 'guaranteed index') {
							// 'x-year $00.000/therm adder'
							// term = x
							// rate = 0
							// type = 'market'
							const match = offerText.match(
								/(\d+)-year\s+\$(\d+(\.\d+)?)\/therm adder/i,
							);
							if (!match) {
								throw Error(
									`Could not parse offer text for Guaranteed Index: '${offerText}'`,
								);
							}
							const [, termStr, rateStr] = match;
							const term = parseInt(termStr, 10);
							const rate = parseFloat(rateStr);
							offers.push(
								MarketOffer.parse({
									id: `market-${term}`,
									market: Market.CIG,
									name,
									rate,
									term,
									type: 'market',
								}),
							);
						} else {
							throw Error(`Unknown offer name: ${name}`);
						}
					});
				});
			});

			return offers;
		});
