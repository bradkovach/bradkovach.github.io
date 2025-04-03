import type { Offer } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/Market';

interface GetQuotePricesResponse {
	PriceOptions: PriceOption[];
}

interface PriceOption {
	FixedBill: number;
	FixedBillCode: string;
	FixedPrice: number;
	FixedPriceCode: string;
	Index: number;
	IndexPriceCode: string;
	Term: '12 Month' | '18 Month' | '24 Month';
}

const headers = {
	Accept: 'application/json, text/plain, */*',
	'Accept-Language': 'en-US,en;q=0.5',
	'Cache-Control': 'no-cache',
	'Content-Type': 'application/json',
	Pragma: 'no-cache',
	Priority: 'u=0',
	'Sec-Fetch-Dest': 'empty',
	'Sec-Fetch-Mode': 'cors',
	'Sec-Fetch-Site': 'same-origin',
	'Sec-GPC': '1',
	'User-Agent':
		'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0',
};

const checkIPUrl = 'https://ifconfig.io/ip';

const CheckAccountNumberUrl = (custOrAcctNumber: string) =>
	`https://enrollment.legacynaturalgas.com/api/Signup/CheckAccountNumber?custOrAcctNumber=${custOrAcctNumber}`;

const GetQuotePricesUrl = (addressOrMeter: string, clientIP: string) =>
	`https://enrollment.legacynaturalgas.com/api/Signup/GetQuotePrices?addressOrMeter=${addressOrMeter}&clientIP=${clientIP}`;

const checkIp = () =>
	fetch(checkIPUrl)
		.then((response) => response.text())
		.then((ip) => ip.trim());

type CheckAccountNumberResponse = {
	AccountNumber: string;
	Email: string;
	MeterNumbers: MeterNumber[];
};

type MeterNumber = {
	BillClass: string;
	ControlNumber: string;
	MeterNumber: string;
};

const checkAccountNumber = (custOrAcctNumber: string): Promise<string> =>
	fetch(CheckAccountNumberUrl(custOrAcctNumber), {
		credentials: 'omit',
		headers,
		method: 'GET',
		mode: 'cors',
		referrer: 'https://www.legacynaturalgas.com/',
	})
		.then((r) => r.json() as unknown as CheckAccountNumberResponse[])
		.then((r) => {
			if (r.length === 0) {
				throw new Error('No account found');
			}
			const { MeterNumbers } = r[0];
			if (MeterNumbers.length === 0) {
				throw new Error('No meter found');
			}
			return MeterNumbers[0].MeterNumber;
		});

const getQuotePrices = (
	addressOrMeter: string,
	clientIP: string,
): Promise<GetQuotePricesResponse> =>
	fetch(GetQuotePricesUrl(addressOrMeter, clientIP), {
		credentials: 'omit',
		headers: {
			Accept: 'application/json, text/plain, */*',
			'Accept-Language': 'en-US,en;q=0.5',
			'Cache-Control': 'no-cache',
			'Content-Type': 'application/json',
			Pragma: 'no-cache',
			'Sec-Fetch-Dest': 'empty',
			'Sec-Fetch-Mode': 'cors',
			'Sec-Fetch-Site': 'same-origin',
			'Sec-GPC': '1',
			'User-Agent':
				'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0',
		},
		method: 'GET',
		mode: 'cors',
		referrer: 'https://www.legacynaturalgas.com/',
	}).then((response) => response.json() as unknown as GetQuotePricesResponse);

export function run(): Promise<Offer[]> {
	const accountNumber = process.env.BHES_ACCOUNT_NUMBER;
	if (!accountNumber) {
		throw new Error('BHES_ACCOUNT_NUMBER not set');
	}
	return Promise.all([checkIp(), checkAccountNumber(accountNumber)])
		.then(([clientIP, addressOrMeter]: [string, string]) =>
			getQuotePrices(addressOrMeter, clientIP),
		)
		.then((quote) =>
			quote.PriceOptions.flatMap((priceOption): Offer[] => {
				if (priceOption.Term === '12 Month') {
					return [
						{
							confirmationCode: priceOption.FixedPriceCode,
							id: `fixed-1`,
							name: 'Fixed Price',
							rate: priceOption.FixedPrice,
							term: 1,
							type: 'fpt',
						},
						{
							confirmationCode: priceOption.IndexPriceCode,
							id: `index-1`,
							market: Market.CIG,
							name: 'Index Price',
							rate: priceOption.Index,
							term: 1,
							type: 'market',
						},
						{
							confirmationCode: priceOption.FixedBillCode,
							id: `fixed-bill-1`,
							name: 'Fixed Bill',
							rate: 0,
							term: 1,
							type: 'fpm',
						},
					];
				} else if (priceOption.Term === '24 Month') {
					return [
						{
							confirmationCode: priceOption.FixedPriceCode,
							id: `fixed-2`,
							name: 'Fixed Price',
							rate: priceOption.FixedPrice,
							term: 2,
							type: 'fpt',
						},
						{
							confirmationCode: priceOption.IndexPriceCode,
							id: `index-2`,
							market: Market.CIG,
							name: 'Index Price',
							rate: priceOption.Index,
							term: 2,
							type: 'market',
						},
						{
							confirmationCode: priceOption.FixedBillCode,
							id: `fixed-bill-2`,
							name: 'Fixed Bill',
							rate: 0,
							term: 2,
							type: 'fpm',
						},
					];
				}

				return [];
			}),
		);
}
