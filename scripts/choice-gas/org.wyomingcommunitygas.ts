import type { Offer } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

import * as crypto from 'crypto';

import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/Market';
import { getEnvAsync } from '../getEnvAsync';

export interface Account {
	accountNumber: string;
	customerNumber: string;
	division: string;
	firstName: string;
	lastName: string;
	premises: Premise[];
}

export interface Premise {
	address: string;
	billClass: string;
	budgetBilling: boolean;
	city: string;
	isBalloted: boolean;
	premiseID: string;
	prices: Price[];
	state: string;
	zip: string;
}

export interface Price {
	giftCard: number;
	price: number;
	priceCode: number;
	priceOption: 'FIXED' | 'FMB' | 'INDEX';
	promoCode: string;
	term: string;
}

export interface Root {
	accounts: Account[];
	errorMessageList: string[];
	isSuccess: boolean;
	programYear: number;
}

const fetchOffers = (
	accountNumber: string,
	correlationId?: string,
	promoCode?: string,
): Promise<Offer[]> => {
	const url = new URL(
		'https://w.ptsrvs.com/api/blackhills/prices/account/' + accountNumber,
	);

	if (correlationId) {
		url.searchParams.set('correlationId', correlationId);
	}

	if (promoCode) {
		url.searchParams.set('PromoCode', promoCode);
	}
	return fetch(url.toString(), {
		credentials: 'omit',
		headers: {
			Accept: '*/*',
			'Accept-Language': 'en-US,en;q=0.5',
			'Cache-Control': 'no-cache',
			Pragma: 'no-cache',
			'Sec-Fetch-Dest': 'empty',
			'Sec-Fetch-Mode': 'cors',
			'Sec-Fetch-Site': 'cross-site',
			'User-Agent':
				'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
		},
		method: 'GET',
		mode: 'cors',
		referrer: 'https://www.wyomingcommunitygas.org/',
	})
		.then((response) => response.json() as Promise<Root>)
		.then((root) => {
			return root.accounts
				.flatMap((account) => {
					return account.premises.flatMap((premise) => {
						return premise.prices.map((price) => {
							const term = Number(price.term[0]);
							const confirmationCode = price.priceCode.toString();
							if (price.priceOption === 'FIXED') {
								const rate = price.price / 100;
								return {
									confirmationCode,
									id: `fpt-${term}`,
									name: 'Fixed Price',
									rate,
									term,
									type: 'fpt',
								} as Offer;
							} else if (price.priceOption === 'FMB') {
								return {
									confirmationCode,
									id: `fpm-${term}`,
									name: 'Fixed Monthly Bill',
									rate: 0,
									term,
									type: 'fpm',
								} as Offer;
							} else if (price.priceOption === 'INDEX') {
								const rate = price.price / 100;
								return {
									confirmationCode,
									id: `market-${term}`,
									market: Market.CIG,
									name: 'Market Index',
									rate,
									term,
									type: 'market',
								} as Offer;
							} else {
								throw new Error(
									`Unknown price option: ${JSON.stringify(
										price,
									)}`,
								);
							}
						});
					});
				})
				.map((offer) => ({
					...offer,
					id: offer.id + (promoCode ? '-' + promoCode : ''),
					isSpecial: promoCode ? true : undefined,
					name: promoCode
						? offer.name + ' - Promo Code ' + promoCode
						: offer.name,
				}));
		});
};

export const run = (): Promise<Offer[]> =>
	getEnvAsync('BHES_ACCOUNT_NUMBER')
		.catch(() => {
			throw new Error('BHES_ACCOUNT_NUMBER not set');
		})
		.then((accountNumber) =>
			Promise.all([
				fetchOffers(accountNumber, crypto.randomUUID()),
				fetchOffers(accountNumber, crypto.randomUUID(), 'UWYO'),
			]).then((results) => results.flat()),
		);
