import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/data.current';
import {
	FixedPerThermOffer,
	MarketOffer,
	Offer,
	OfferBase,
} from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

export interface SymmetryProduct {
	id: number;
	name: string;
	code: string;
	status: string;
	utility_id: number;
	broker_id: any;
	utility_name: string;
	utility_code: string;
	price_adder: string;
	latest_price: string;
	price_units: string;
	term_type: string;
	term_months: string;
	term_start_date: string;
	term_end_date: string;
	etf_amount: string;
	deposit_amount: string;
	price_type: string;
	segment: string;
	channel: string;
	customer_type: string;
	offer_type: string;
	promotion_only: boolean;
	broker_only: boolean;
	description: string;
	contract_url: any;
	price_index_name?: string;
	pool_code: string;
	url: string;
	customer_charges: any[];
}

export function run(): Promise<Offer[]> {
	return fetch(
		'https://choice.symmetryenergy.com/wp-content/api/index.php?api/choice_customers/694251/products',
		{
			credentials: 'omit',
			headers: {
				'User-Agent':
					'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
				Accept: 'application/json, text/plain, */*',
				'Accept-Language': 'en-US,en;q=0.5',
				'Alt-Used': 'choice.symmetryenergy.com',
				'Sec-Fetch-Dest': 'empty',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Site': 'same-origin',
				Pragma: 'no-cache',
				'Cache-Control': 'no-cache',
			},
			referrer: 'https://choice.symmetryenergy.com/enrollment/',
			method: 'GET',
			mode: 'cors',
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
						id: product.code,
						name: product.name,
						term,
						confirmationCode: product.pool_code,
						market: Market.CIG,
						rate: Number(product.price_adder),
						type: 'market',
					};
				} else if (product.price_type === 'Fixed') {
					return <FixedPerThermOffer & OfferBase>{
						id: product.code,
						name: product.name,
						term,
						confirmationCode: product.pool_code,
						rate: Number(product.price_adder),
						type: 'fpt',
					};
				} else if (product.price_type === 'Managed') {
					return <FixedPerThermOffer & OfferBase>{
						id: product.code,
						name: product.name,
						term,
						confirmationCode: product.pool_code,
						rate: Number(product.latest_price),
						type: 'fpt',
					};
				} else {
					throw new Error(
						`Unknown price type: ${product.price_type}`,
					);
				}
			}),
		);
}
