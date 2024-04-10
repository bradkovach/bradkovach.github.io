import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/data.current';
import { Offer } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

type ExtractFn<T extends Offer> = (
	term: number,
	name: string,
	priceText: string,
	confirmationCode: string,
) => T;

interface PriceOption {
	Term: '18 Month' | '12 Month' | '24 Month';
	FixedPrice: number;
	FixedPriceCode: string;
	Index: number;
	IndexPriceCode: string;
	FixedBill: number;
	FixedBillCode: string;
}

interface GetQuotePricesResponse {
	PriceOptions: PriceOption[];
}

const checkIPUrl = 'https://ifconfig.io/ip';
const CheckAccountNumberUrl = `https://enrollment.legacynaturalgas.com/api/Signup/CheckAccountNumber?custOrAcctNumber=${process.env.BHES_ACCOUNT_NUMBER}`;
const GetQuotePricesUrl = (addressOrMeter: string, clientIP: string) =>
	`https://enrollment.legacynaturalgas.com/api/Signup/GetQuotePrices?addressOrMeter=${addressOrMeter}&clientIP=${clientIP}`;
export function run(): Promise<Offer[]> {
	return Promise.all([
		fetch(checkIPUrl)
			.then((response) => response.text())
			.then((ip) => ip.trim()),
		fetch(CheckAccountNumberUrl, {
			credentials: 'omit',
			headers: {
				'User-Agent':
					'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
				Accept: 'application/json, text/plain, */*',
				'Accept-Language': 'en-US,en;q=0.5',
				'Content-Type': 'application/json',
				'Sec-Fetch-Dest': 'empty',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Site': 'same-origin',
			},
			referrer: 'https://enrollment.legacynaturalgas.com/',
			method: 'GET',
			mode: 'cors',
		}).then((response) => response.json() as unknown as string),
	])
		.then(([clientIP, addressOrMeter]: [string, string]) =>
			fetch(GetQuotePricesUrl(addressOrMeter, clientIP), {
				credentials: 'omit',
				headers: {
					'User-Agent':
						'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
					Accept: 'application/json, text/plain, */*',
					'Accept-Language': 'en-US,en;q=0.5',
					'Content-Type': 'application/json',
					'Sec-Fetch-Dest': 'empty',
					'Sec-Fetch-Mode': 'cors',
					'Sec-Fetch-Site': 'same-origin',
				},
				referrer: 'https://enrollment.legacynaturalgas.com/',
				method: 'GET',
				mode: 'cors',
			}),
		)
		.then(
			(response) => response.json() as unknown as GetQuotePricesResponse,
		)
		.then((quote) =>
			quote.PriceOptions.flatMap((priceOption): Offer[] => {
				if (priceOption.Term === '18 Month') {
					return [];
				} else if (priceOption.Term === '12 Month') {
					return [
						{
							type: 'fpt',
							id: `fixed-1`,
							name: 'Fixed Price',
							term: 1,
							rate: priceOption.FixedPrice,
							confirmationCode: priceOption.FixedPriceCode,
						},
						{
							type: 'market',
							id: `index-1`,
							name: 'Index Price',
							term: 1,
							rate: priceOption.Index,
							market: Market.CIG,
							confirmationCode: priceOption.IndexPriceCode,
						},
						{
							type: 'fpm',
							id: `fixed-bill-1`,
							name: 'Fixed Bill',
							term: 1,
							rate: 0,
							confirmationCode: priceOption.FixedBillCode,
						},
					];
				} else if (priceOption.Term === '24 Month') {
					return [
						{
							type: 'fpt',
							id: `fixed-2`,
							name: 'Fixed Price',
							term: 2,
							rate: priceOption.FixedPrice,
							confirmationCode: priceOption.FixedPriceCode,
						},
						{
							type: 'market',
							id: `index-2`,
							name: 'Index Price',
							term: 2,
							rate: priceOption.Index,
							market: Market.CIG,
							confirmationCode: priceOption.IndexPriceCode,
						},
						{
							type: 'fpm',
							id: `fixed-bill-2`,
							name: 'Fixed Bill',
							term: 2,
							rate: 0,
							confirmationCode: priceOption.FixedBillCode,
						},
					];
				} else {
					return [];
				}
			}),
		);
}
