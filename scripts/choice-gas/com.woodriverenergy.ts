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

const secondRequest = (offerId: string) => {
	const url = new URL(
		`./quote/${offerId}`,
		`https://choice.woodriverenergy.com/`,
	);
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
import prettier from 'prettier';

import type { FixedPerMonthOffer } from '../../projects/choice-gas/src/app/schema/fixed-per-month.z';
import type { FixedPerThermOffer } from '../../projects/choice-gas/src/app/schema/fixed-per-therm-offer.z';
import type { MarketOffer } from '../../projects/choice-gas/src/app/schema/market-offer.z';

import { Market } from '../../projects/choice-gas/src/app/data/Market';

export const run = (): Promise<AnyOffer[]> =>
	getEnvAsync('BHE_PREMISE_ID')
		.catch(() => getEnvAsync('BHES_ACCOUNT_NUMBER'))
		.catch(() => {
			throw new Error('BHE_PREMISE_ID or BHES_ACCOUNT_NUMBER not set');
		})
		.then((premise_or_account_num) => getOfferPage(premise_or_account_num))
		.then((response) => response.text())
		.then((html) => prettier.format(html, { parser: 'html' }))
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
								console.warn(
									`Could not parse offer text for Secure Fixed Price: '${offerText}'`,
								);
								return;
							}
							const [, termStr, rateStr] = match;
							const term = parseInt(termStr, 10);

							const offer: FixedPerMonthOffer = {
								id: `fpm-${term}`,
								name,
								// rate: 0,
								term,
								type: 'fpm',
							};

							offers.push(offer);
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
								console.warn(
									`Could not parse offer text for Guaranteed Fixed Price: '${offerText}'`,
								);
								return;
							}
							const [, termStr, rateStr] = match;
							const term = parseInt(termStr, 10);
							const rate = parseFloat(rateStr);

							const offer: FixedPerThermOffer = {
								id: `fpt-${term}`,
								name,
								rate,
								term,
								type: 'fpt',
							};
							offers.push(offer);
						} else if (name.toLowerCase() === 'guaranteed index') {
							// 'x-year $00.000/therm adder'
							// term = x
							// rate = 0
							// type = 'market'
							const match = offerText.match(
								/(\d+)-year\s+\$(\d+(\.\d+)?)\/therm adder/i,
							);
							if (!match) {
								console.warn(
									`Could not parse offer text for Guaranteed Index: '${offerText}'`,
								);
								return;
							}
							const [, termStr, rateStr] = match;
							const term = parseInt(termStr, 10);
							const rate = parseFloat(rateStr);
							const offer: MarketOffer = {
								id: `market-${term}`,
								market: Market.CIG,
								name,
								rate,

								term,
								type: 'market',
							};
							offers.push(offer);
						} else {
							console.warn(`Unknown offer name: ${name}`);
						}
					});

					const id = fieldset
						.find('> label > input[type=radio]')
						.attr('value');
				});

				// console.log('--- OFFER START ---');
				// console.log('Header:', header.text().trim());
				// console.log('Section:', section.text().trim());
				// console.log('Footer:', footer.text().trim());
				// console.log('--- OFFER END ---');
			});

			return offers;
		});
// .then((root) => [
// 	...root.quote.fixed_per_month.slice(0, 2).map((rate, i) => {
// 		return {
// 			id: `fpm-${i + 1}`,
// 			name: 'Secure Fixed Price - Fixed Monthly Bill',
// 			rate: 0,
// 			term: i + 1,
// 			type: 'fpm',
// 		} as AnyOffer;
// 	}),
// 	...root.quote.fixed_per_therm.slice(0, 2).map((rate, i) => {
// 		return {
// 			id: `fpt-${i + 1}`,
// 			name: 'Guaranteed Fixed Price',
// 			rate,
// 			term: i + 1,
// 			type: 'fpt',
// 		} as AnyOffer;
// 	}),
// 	...root.quote.index.slice(0, 2).map((rate, i) => {
// 		return {
// 			id: `index-${i + 1}`,
// 			market: Market.CIG,
// 			name: 'Guaranteed Index',
// 			rate,
// 			term: i + 1,
// 			type: 'market',
// 		} as AnyOffer;
// 	}),
// ]),
// );
