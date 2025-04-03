import type { Offer } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/Market';
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

export const run = (): Promise<Offer[]> =>
	getEnvAsync('BHE_PREMISE_ID')
		.catch(() => getEnvAsync('BHES_ACCOUNT_NUMBER'))
		.catch(() => {
			throw new Error('BHE_PREMISE_ID or BHES_ACCOUNT_NUMBER not set');
		})
		.then((premise_or_account_num) =>
			fetch(
				'https://blink-prod.dokku.woodriverenergy.com/choice/create-quote',
				{
					body: JSON.stringify({
						premise_or_account_num: Number(premise_or_account_num),
					}),
					credentials: 'omit',
					headers: {
						Accept: 'application/json',
						'Accept-Language': 'en-US,en;q=0.5',
						'Cache-Control': 'no-cache',
						'content-type': 'application/json',
						Pragma: 'no-cache',
						'Sec-Fetch-Dest': 'empty',
						'Sec-Fetch-Mode': 'cors',
						'Sec-Fetch-Site': 'same-site',
						'User-Agent':
							'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
					},
					method: 'POST',
					mode: 'cors',
					referrer: 'https://www.woodriverenergy.com/',
				},
			)
				.then(
					(response) =>
						response.json() as Promise<CreateQuoteResponse>,
				)
				.then((root) => [
					...root.quote.fixed_per_month.slice(0, 2).map((rate, i) => {
						return {
							id: `fpm-${i + 1}`,
							name: 'Secure Fixed Price - Fixed Monthly Bill',
							rate: 0,
							term: i + 1,
							type: 'fpm',
						} as Offer;
					}),
					...root.quote.fixed_per_therm.slice(0, 2).map((rate, i) => {
						return {
							id: `fpt-${i + 1}`,
							name: 'Guaranteed Fixed Price',
							rate,
							term: i + 1,
							type: 'fpt',
						} as Offer;
					}),
					...root.quote.index.slice(0, 2).map((rate, i) => {
						return {
							id: `index-${i + 1}`,
							market: Market.CIG,
							name: 'Guaranteed Index',
							rate,
							term: i + 1,
							type: 'market',
						} as Offer;
					}),
				]),
		);
