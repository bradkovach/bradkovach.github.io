import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/data.current';
import { Offer } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

export interface CreateQuoteResponse {
	premise_count: number;
	balloted: boolean;
	quote: Quote;
}

export interface Quote {
	id: number;
	pub_index: string;
	account_num: number;
	bill_class: string;
	last_name: string;
	email: string;
	premise_num: number;
	service_address: string;
	service_state: string;
	fixed_per_month: number[];
	fixed_per_therm: number[];
	index: number[];
	volume: number;
}

export function run(): Promise<Offer[]> {
	const premise_or_account_num =
		process.env.BHE_PREMISE_ID || process.env.BHES_ACCOUNT_NUMBER;
	if (!premise_or_account_num) {
		throw new Error('BHE_PREMISE_ID or BHES_ACCOUNT_NUMBER not set');
	}
	return fetch(
		'https://blink-prod.dokku.woodriverenergy.com/choice/create-quote',
		{
			credentials: 'omit',
			headers: {
				'User-Agent':
					'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
				Accept: 'application/json',
				'Accept-Language': 'en-US,en;q=0.5',
				'content-type': 'application/json',
				'Sec-Fetch-Dest': 'empty',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Site': 'same-site',
				Pragma: 'no-cache',
				'Cache-Control': 'no-cache',
			},
			referrer: 'https://www.woodriverenergy.com/',
			// "body": "{\"premise_or_account_num\":9152859605}",
			body: JSON.stringify({
				premise_or_account_num: Number(premise_or_account_num),
			}),
			method: 'POST',
			mode: 'cors',
		},
	)
		.then((response) => response.json() as Promise<CreateQuoteResponse>)
		.then((root) => {
			return [
				...root.quote.fixed_per_month.slice(0, 2).map((rate, i) => {
					return {
						type: 'fpm',
						id: `fpm-${i + 1}`,
						name: 'Secure Fixed Price - Fixed Monthly Bill',
						term: i + 1,
						rate: 0,
					} as Offer;
				}),
				...root.quote.fixed_per_therm.slice(0, 2).map((rate, i) => {
					return {
						type: 'fpt',
						id: `fpt-${i + 1}`,
						name: 'Guaranteed Fixed Price',
						term: i + 1,
						rate,
					} as Offer;
				}),
				...root.quote.index.slice(0, 2).map((rate, i) => {
					return {
						type: 'market',
						id: `index-${i + 1}`,
						name: 'Guaranteed Index',
						market: Market.CIG,
						term: i + 1,
						rate,
					} as Offer;
				}),
			];
		});
}
