import type { AnyOffer } from '../../projects/choice-gas/src/app/schema/offer.z';

import { Market } from '../../projects/choice-gas/src/app/data/Market';
import { FixedPerThermOffer } from '../../projects/choice-gas/src/app/schema/fixed-per-therm-offer.z';
import { MarketOffer } from '../../projects/choice-gas/src/app/schema/market-offer.z';
import { getEnvAsync } from '../getEnvAsync';
import { responseToJson } from './util';

export interface SymmetryAccount {
	account_name: string;
	/**
	 * Black Hills Account #
	 */
	account_number: string;
	company_name: null | string;
	email: string;
	first_name: string;
	/**
	 * Symmetry Account ID
	 */
	id: number;
	last_name: string;
	phone: string;
	segment: string;
	service_city: string;
	service_state: string;
	service_street: string;
	service_zip: string;
	utility_id: number;
}

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

const getSymmetryAccounts = (
	accountNumber: string,
): Promise<SymmetryAccount[]> => {
	const referrer = 'https://symmetryenergy.com/enroll/?zip-code=82070';
	return fetch(
		`https://symmetryenergy.com/wp-content/api/index.php?api/choice_customers?account_number=${accountNumber}`,
		{
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Accept-Language': 'en-US,en;q=0.9',
				Connection: 'keep-alive',
				Priority: 'u=0',
				Referer: referrer,
				'Sec-Fetch-Dest': 'empty',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Site': 'same-origin',
				TE: 'trailers',
				'User-Agent':
					'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0',
			},
			method: 'GET',
			mode: 'cors',
			referrer: referrer,
		},
	).then(responseToJson<SymmetryAccount[]>());
};

const getSymmetryProducts = (
	zipCode: string,
	serviceId: string,
	bhAccountId: string,
	customerType: string = 'existing',
) =>
	fetch(
		`https://symmetryenergy.com/enrollment/api/products?zipCode=${zipCode}&type=Residential&serviceId=${serviceId}&customerType=${customerType}&bhAccountId=${bhAccountId}`,
		{
			credentials: 'include',
			headers: {
				Accept: '*/*',
				'Accept-Language': 'en-US,en;q=0.9',
				Priority: 'u=4',
				'Sec-Fetch-Dest': 'empty',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Site': 'same-origin',
				'User-Agent':
					'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0',
			},
			method: 'POST',
			mode: 'cors',
			referrer: 'https://symmetryenergy.com/enrollment/',
		},
	).then(responseToJson<SymmetryProduct[]>());

export const run = (): Promise<AnyOffer[]> =>
	getEnvAsync('BHES_ACCOUNT_NUMBER')
		.then((accountNumber) => getSymmetryAccounts(accountNumber))
		.then(([account]) =>
			getSymmetryProducts(
				account.service_zip,
				account.utility_id.toString(),
				account.id.toString(),
			),
		)
		.then((products) =>
			products.flatMap<AnyOffer>((product): AnyOffer[] => {
				const name = product.name.trim();
				const term =
					new Date(product.term_end_date).getFullYear() -
					new Date(product.term_start_date).getFullYear();

				if (product.price_type === 'Fixed') {
					return [
						FixedPerThermOffer.parse({
							confirmationCode: product.pool_code,
							id: `fpt-${term}`,
							name,
							rate: Number(product.price_adder),
							term,
							type: 'fpt',
						}),
					];
				} else if (product.price_type === 'Indexed') {
					return [
						MarketOffer.parse({
							confirmationCode: product.pool_code,
							id: `market-${term}`,
							market: Market.CIG,
							name,
							rate: Number(product.price_adder),
							term,
							type: 'market',
						}),
					];
				} else if (product.price_type === 'Managed') {
					return [
						FixedPerThermOffer.parse({
							confirmationCode: product.pool_code,
							id: `managed-${term}`,
							name,
							rate: Number(product.latest_price),
							term,
							type: 'fpt',
						}),
					];
				} else {
					throw Error(
						`com.symmetryenergy: Unknown price type: ${product.price_type}`,
					);
				}
			}),
		);
