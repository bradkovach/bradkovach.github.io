import type {
	BlendedOffer,
	FixedPerMonthOffer,
	FixedPerThermOffer,
	MarketOffer,
	Offer,
	OfferBase,
} from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

import * as cheerio from 'cheerio';

import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/Market';
import { getEnvAsync } from '../getEnvAsync';

export function run(): Promise<Offer[]> {
	let cookie = '';
	const updateCookie = (postResponse: Response) => {
		cookie = postResponse.headers.get('set-cookie') || cookie;
		return postResponse.text();
	};
	const headers = (cookie: string) => ({
		Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
		'Accept-Language': 'en-US,en;q=0.5',
		'Cache-Control': 'no-cache',
		Cookie: cookie,
		Pragma: 'no-cache',
		'Sec-Fetch-Dest': 'document',
		'Sec-Fetch-Mode': 'navigate',
		'Sec-Fetch-Site': 'same-origin',
		'Sec-Fetch-User': '?1',
		'Upgrade-Insecure-Requests': '1',
		'User-Agent':
			'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
	});
	return getEnvAsync('BHES_ACCOUNT_NUMBER').then((accountNumber) =>
		fetch('https://www.blackhillsenergyservices.com')
			.then(updateCookie)
			.then((text) => {
				const $ = cheerio.load(text);
				return $('input[type=hidden][name=form_build_id]').val();
			})
			.then((form_build_id) =>
				fetch('https://www.blackhillsenergyservices.com/', {
					body: Object.entries({
						form_build_id: form_build_id,
						form_id: 'bhes_account_form_number',
						number: accountNumber,
						op: 'Continue',
					}).reduce((formData, [key, value]) => {
						formData.append(key, value?.toString());
						return formData;
					}, new FormData()),
					headers: headers(cookie),
					method: 'POST',
					referrer: 'https://www.blackhillsenergyservices.com/',
				}),
			)
			.then(updateCookie)
			.then(() => {
				return fetch(
					'https://www.blackhillsenergyservices.com/account/properties',
					{
						credentials: 'include',
						headers: headers(cookie),
						// headers: {
						// 	Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
						// 	'Accept-Language': 'en-US,en;q=0.5',
						// 	'Cache-Control': 'no-cache',
						// 	Cookie: cookie,
						// 	Pragma: 'no-cache',
						// 	'Sec-Fetch-Dest': 'document',
						// 	'Sec-Fetch-Mode': 'navigate',
						// 	'Sec-Fetch-Site': 'same-origin',
						// 	'Sec-Fetch-User': '?1',
						// 	'Upgrade-Insecure-Requests': '1',
						// 	'User-Agent':
						// 		'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
						// },
						method: 'GET',
						mode: 'cors',
						referrer: 'https://www.blackhillsenergyservices.com/',
					},
				);
			})
			.then((response) => response.text())
			.then((accountPropertiesText) =>
				cheerio.load(accountPropertiesText, {
					recognizeCDATA: true,
					recognizeSelfClosing: true,
				}),
			)
			.then(($) =>
				$('#edit-premises .fieldset-wrapper details')
					.toArray()
					.flatMap((details) => {
						const name = $(details).find('summary div span').text();

						return $(details)
							.find('table tbody tr')
							.toArray()
							.map((tr) => {
								// term at td:nth-of-type(1) > div > label as 'n Year' or 'n Years'
								// price at td:nth-of-type(2)
								// confirmation code at td:nth-of-type(3)
								const tds = $(tr).find('td').toArray();
								const [term, priceText, confirmationCode] =
									tds.map((td) => $(td).text().trim());
								return {
									confirmationCode,
									name,
									priceText,
									term: Number(term[0]),
								};
							});
					})
					.map((o) => {
						const confirmationCode =
							o.confirmationCode &&
							o.confirmationCode.length === 5
								? o.confirmationCode
								: undefined;
						if (o.name === 'Fixed Rate per therm') {
							// $xxx.xx/month
							//  ~~~~~~
							const rate = o.priceText.slice(1).split('/')[0];
							return <FixedPerThermOffer & OfferBase>{
								confirmationCode,
								id: `ratelock-${o.term}`,
								name: 'Rate Lock',
								rate: Number(rate),
								term: Number(o.term),
								type: 'fpt',
							};
						} else if (o.name === 'WinterGuard') {
							return <FixedPerMonthOffer & OfferBase>{
								confirmationCode,
								id: 'winterguard-' + o.term,
								name: 'WinterGuard',
								rate: 0,
								term: o.term,
								type: 'fpm',
							};
						} else if (o.name === 'Blended Smart Rates per therm') {
							// 50% billed at $0.45/therm and 50% billed at Market Index Rate - CIG plus an adder of $0.112/therm
							// ~~~            ~~~~           ~~                                                      ~~~~~
							const [fptText, marketText] = o.priceText
								.split(' and ')
								.map((str) => str.trim());
							const fptMatch = fptText.match(/(\d+\.\d+)\/therm/);
							const marketMatch =
								marketText.match(/(\d+\.\d+)\/therm/);
							if (!fptMatch || !marketMatch) {
								throw new Error(
									'Failed to parse Blended Rates',
								);
							}
							const fpt = parseFloat(fptMatch[1]);
							const market = parseFloat(marketMatch[1]);
							return <BlendedOffer & OfferBase>{
								confirmationCode,
								id: `blended-${o.term}`,
								name: 'Blended',
								offers: [
									[
										0.5,
										{
											rate: fpt,
											type: 'fpt',
										} as FixedPerThermOffer,
									],
									[
										0.5,
										{
											market: Market.CIG,
											rate: market,
											type: 'market',
										} as MarketOffer,
									],
								],
								term: Number(o.term),
								type: 'blended',
							};
						} else if (o.name === 'Market Index Rate per therm') {
							// Market Index Rate - CIG plus an adder of $0.112/therm
							//                                           ~~~~~
							const cigmatch = o.priceText.match(
								/CIG plus an adder of \$(\d+\.\d+)\/therm/,
							);
							if (!cigmatch) {
								throw new Error('Failed to parse Index Rates');
							}
							const cig = parseFloat(cigmatch[1]);
							return <MarketOffer & OfferBase>{
								confirmationCode,
								id: `market-${o.term}`,
								market: Market.CIG,
								name: 'Market Index',
								rate: cig,
								term: Number(o.term),
								type: 'market',
							};
						} else {
							throw new Error('Unknown offer type, ' + o.name);
						}
					}),
			),
	);
}
