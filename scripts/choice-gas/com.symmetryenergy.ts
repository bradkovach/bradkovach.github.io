import type {
	FixedPerThermOffer,
	MarketOffer,
	Offer,
	OfferBase,
} from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/Market';

export interface SymmetryProduct {
	// broker_id: any;
	broker_only: boolean;
	channel: string;
	code: string;
	// contract_url: any;
	// customer_charges: any[];
	customer_type: string;
	deposit_amount: string;
	description: string;
	etf_amount: string;
	id: number;
	latest_price: string;
	name: string;
	offer_type: string;
	pool_code: string;
	price_adder: string;
	price_index_name?: string;
	price_type: string;
	price_units: string;
	promotion_only: boolean;
	segment: string;
	status: string;
	term_end_date: string;
	term_months: string;
	term_start_date: string;
	term_type: string;
	url: string;
	utility_code: string;
	utility_id: number;
	utility_name: string;
}

/*
await fetch("https://symmetryenergy.com/enrollment/api/products?zipCode=82070&type=Residential&serviceId=12&customerType=existing&bhAccountId=783138", {
    "credentials": "include",
    "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0",
        "Accept": "",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-GPC": "1",
        "Alt-Used": "symmetryenergy.com",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Priority": "u=4",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
    },
    "referrer": "https://symmetryenergy.com/enrollment/",
    "method": "POST",
    "mode": "cors"
});
*/

export const run = (): Promise<Offer[]> =>
	fetch(
		'https://symmetryenergy.com/enrollment/api/products?zipCode=82070&type=Residential&serviceId=12&customerType=existing&bhAccountId=783138',
		{
			credentials: 'omit',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Accept-Language': 'en-US,en;q=0.5',
				'Alt-Used': 'choice.symmetryenergy.com',
				'Cache-Control': 'no-cache',
				Pragma: 'no-cache',
				'Sec-Fetch-Dest': 'empty',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Site': 'same-origin',
				'User-Agent':
					'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
			},
			method: 'POST',
			mode: 'cors',
			referrer: 'https://choice.symmetryenergy.com/enrollment/',
		},
	)
		.then((response) => response.json())
		.then((products: SymmetryProduct[]) =>
			products.map((product) => {
				// term_start_date and term_end_date are yyyy-mm-dd
				// id = product.code
				// end_date year - start_date year = term
				const term =
					new Date(product.term_end_date).getFullYear() -
					new Date(product.term_start_date).getFullYear();
				// confirmationCode = pool_code
				if (product.price_type === 'Indexed') {
					return <MarketOffer & OfferBase>{
						confirmationCode: product.pool_code,
						id: product.code,
						market: Market.CIG,
						name: product.name,
						rate: Number(product.price_adder),
						term,
						type: 'market',
					};
				} else if (product.price_type === 'Fixed') {
					return <FixedPerThermOffer & OfferBase>{
						confirmationCode: product.pool_code,
						id: product.code,
						name: product.name,
						rate: Number(product.price_adder),
						term,
						type: 'fpt',
					};
				} else if (product.price_type === 'Managed') {
					return <FixedPerThermOffer & OfferBase>{
						confirmationCode: product.pool_code,
						id: product.code,
						name: product.name,
						rate: Number(product.latest_price),
						term,
						type: 'fpt',
					};
				} else {
					throw new Error(
						`Unknown price type: ${product.price_type}`,
					);
				}
			}),
		);
