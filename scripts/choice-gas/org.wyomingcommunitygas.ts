import * as crypto from 'crypto';
import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/data.current';
import { Offer } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

export interface Root {
	programYear: number;
	accounts: Account[];
	isSuccess: boolean;
	errorMessageList: any[];
}

export interface Account {
	division: string;
	accountNumber: string;
	customerNumber: string;
	firstName: string;
	lastName: string;
	premises: Premise[];
}

export interface Premise {
	premiseID: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	prices: Price[];
	isBalloted: boolean;
	billClass: string;
	budgetBilling: boolean;
}

export interface Price {
	priceOption: 'FIXED' | 'FMB' | 'INDEX';
	term: string;
	priceCode: number;
	price: number;
	promoCode: string;
	giftCard: number;
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
			'User-Agent':
				'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
			Accept: '*/*',
			'Accept-Language': 'en-US,en;q=0.5',
			'Sec-Fetch-Dest': 'empty',
			'Sec-Fetch-Mode': 'cors',
			'Sec-Fetch-Site': 'cross-site',
			Pragma: 'no-cache',
			'Cache-Control': 'no-cache',
		},
		referrer: 'https://www.wyomingcommunitygas.org/',
		method: 'GET',
		mode: 'cors',
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
								return <Offer>{
									type: 'fpt',
									id: `fpt-${term}`,
									name: 'Fixed Price',
									term,
									rate,
									confirmationCode,
								};
							} else if (price.priceOption === 'FMB') {
								return <Offer>{
									type: 'fpm',
									id: `fpm-${term}`,
									name: 'Fixed Monthly Bill',
									term,
									rate: 0,
									confirmationCode,
								};
							} else if (price.priceOption === 'INDEX') {
								const rate = price.price / 100;
								return <Offer>{
									type: 'market',
									id: `market-${term}`,
									name: 'Market Index',
									term,
									market: Market.CIG,
									rate,
									confirmationCode,
								};
							} else {
								throw new Error(
									'Unknown price option: ' +
										price.priceOption,
								);
							}
						});
					});
				})
				.map((offer) => ({
					...offer,
					id: offer.id + (promoCode ? '-' + promoCode : ''),
					name: promoCode
						? offer.name + ' - Promo Code ' + promoCode
						: offer.name,
					isSpecial: promoCode ? true : undefined,
				}));
		});
};

export function run(): Promise<Offer[]> {
	const accountNumber = process.env.BHES_ACCOUNT_NUMBER;
	if (!accountNumber) {
		throw new Error('BHES_ACCOUNT_NUMBER not set');
	}
	return Promise.all([
		fetchOffers(accountNumber, crypto.randomUUID()),
		fetchOffers(accountNumber, crypto.randomUUID(), 'UWYO'),
	]).then((results) => results.flat());
}
