import * as crypto from 'crypto';

import type { AnyOffer } from '../../projects/choice-gas/src/app/schema/offer.z';

import { Market } from '../../projects/choice-gas/src/app/data/Market';
import { FixedPerMonthOffer } from '../../projects/choice-gas/src/app/schema/fixed-per-month.z';
import { FixedPerThermOffer } from '../../projects/choice-gas/src/app/schema/fixed-per-therm-offer.z';
import { MarketOffer } from '../../projects/choice-gas/src/app/schema/market-offer.z';
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
): Promise<AnyOffer[]> => {
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
		.then((root) =>
			root.accounts
				.flatMap((account) =>
					account.premises.flatMap((premise) =>
						premise.prices.map((price) => {
							const term = Number(price.term[0]);
							const confirmationCode = price.priceCode.toString();
							if (price.priceOption === 'FIXED') {
								return FixedPerThermOffer.parse({
									confirmationCode,
									id: `fpt-${term}`,
									name: 'Fixed Price',
									rate: price.price / 100,
									term,
									type: 'fpt',
								});
							} else if (price.priceOption === 'FMB') {
								return FixedPerMonthOffer.parse({
									confirmationCode,
									id: `fpm-${term}`,
									name: 'Fixed Monthly Bill',
									rate: price.price / 100,
									term,
									type: 'fpm',
								});
							} else if (price.priceOption === 'INDEX') {
								return MarketOffer.parse({
									confirmationCode,
									id: `market-${term}`,
									market: Market.CIG,
									name: 'Market Index',
									rate: price.price / 100,
									term,
									type: 'market',
								});
							} else {
								throw new Error(
									`Unknown price option: ${JSON.stringify(
										price,
									)}`,
								);
							}
						}),
					),
				)
				.map((offer) => ({
					...offer,
					id: offer.id + (promoCode ? '-' + promoCode : ''),
					isSpecial: promoCode ? true : undefined,
					name: promoCode
						? offer.name + ' - Promo Code ' + promoCode
						: offer.name,
				})),
		);
};

export const run = (): Promise<AnyOffer[]> =>
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
