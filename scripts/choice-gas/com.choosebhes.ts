import cheerio from 'cheerio';
import fs from 'node:fs';
import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/data.current';
import {
	BlendedOffer,
	FixedPerMonthOffer,
	FixedPerThermOffer,
	MarketOffer,
	Offer,
	OfferBase,
} from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

type ExtractFn<T extends Offer> = (
	term: number,
	name: string,
	priceText: string,
	confirmationCode: string,
) => T;
function run() {
	const url =
		'https://www.blackhillsenergy.com/services/choice-gas-program/wyoming-choice-gas-customers/black-hills-wyoming-gas-llc-utility-gas';
	// fetch(url)
	const accountNumber = process.env.BHES_ACCOUNT_NUMBER;
	let cookie = '';
	fetch('https://www.blackhillsenergyservices.com')
		.then((response) => {
			cookie = response.headers.get('set-cookie') || cookie;
			return response.text();
		})

		.then((text) => {
			const $ = cheerio.load(text);
			return $('input[type=hidden][name=form_build_id]').val();
		})
		.then((form_build_id) => {
			return fetch('https://www.blackhillsenergyservices.com/', {
				// credentials: 'include',
				// redirect: 'follow',
				headers: {
					'User-Agent':
						'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
					Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
					'Accept-Language': 'en-US,en;q=0.5',
					'Content-Type': 'application/x-www-form-urlencoded',
					'Upgrade-Insecure-Requests': '1',
					'Sec-Fetch-Dest': 'document',
					'Sec-Fetch-Mode': 'navigate',
					'Sec-Fetch-Site': 'same-origin',
					'Sec-Fetch-User': '?1',
					Pragma: 'no-cache',
					'Cache-Control': 'no-cache',
					Cookie: cookie,
				},
				referrer: 'https://www.blackhillsenergyservices.com/',
				body:
					'number=' +
					accountNumber +
					'&form_build_id=' +
					form_build_id +
					'&form_id=bhes_account_form_number&op=Continue',
				method: 'POST',
				// mode: 'cors',
				// credentials: 'include',
			});
		})
		.then((postResponse) => {
			cookie = postResponse.headers.get('set-cookie') || cookie;
			return postResponse.text();
		})
		.then((postResponseText) => {
			return fetch(
				'https://www.blackhillsenergyservices.com/account/properties',
				{
					credentials: 'include',
					headers: {
						'User-Agent':
							'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
						Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
						'Accept-Language': 'en-US,en;q=0.5',
						'Upgrade-Insecure-Requests': '1',
						'Sec-Fetch-Dest': 'document',
						'Sec-Fetch-Mode': 'navigate',
						'Sec-Fetch-Site': 'same-origin',
						'Sec-Fetch-User': '?1',
						Pragma: 'no-cache',
						'Cache-Control': 'no-cache',
						Cookie: cookie,
					},
					referrer: 'https://www.blackhillsenergyservices.com/',
					method: 'GET',
					mode: 'cors',
				},
			);
		})

		.then((response) => response.text())
		.then((accountPropertiesText) => {
			return cheerio.load(accountPropertiesText, {
				quirksMode: true,
				recognizeSelfClosing: true,
				scriptingEnabled: true,
				recognizeCDATA: true,
			});
		})
		.then(($) =>
			$('#edit-premises .fieldset-wrapper details')
				.map((rowIdx, details) => {
					const name = $(details).find('summary div span').text();

					return $(details)
						.find('table tbody tr')
						.map((rowIdx, tr) => {
							// term at td:nth-of-type(1) > div > label as 'n Year' or 'n Years'
							// price at td:nth-of-type(2)
							// confirmation code at td:nth-of-type(3)
							const tds = $(tr).find('td').toArray();
							const [term, priceText, confirmationCode] = tds.map(
								(td) => $(td).text().trim(),
							);
							return {
								name,
								term: Number(term[0]),
								priceText,
								confirmationCode,
							};
						})
						.toArray();
				})
				.toArray()
				.map((o) => {
					if (o.name === 'Fixed Rates') {
						// $xxx.xx/month
						//  ~~~~~~
						const rate = o.priceText.slice(1).split('/')[0];
						return <FixedPerThermOffer & OfferBase>{
							id: `ratelock-${o.term}`,
							name: 'Rate Lock',
							term: Number(o.term),
							confirmationCode: o.confirmationCode,
							rate: Number(rate),
							type: 'fpt',
						};
					} else if (o.name === 'WinterGuard') {
						return <FixedPerMonthOffer & OfferBase>{
							id: 'winterguard-' + o.term,
							name: 'WinterGuard',
							term: o.term,
							confirmationCode: o.confirmationCode,
							rate: 0,
							type: 'fpm',
						};
					} else if (o.name === 'Blended Rates') {
						// 50% billed at $0.45/therm and 50% billed at Market Index Rate - CIG plus an adder of $0.112/therm
						// ~~~            ~~~~           ~~                                                      ~~~~~
						const [fptText, marketText] = o.priceText
							.split(' and ')
							.map((str) => str.trim());
						const fptMatch = fptText.match(/(\d+\.\d+)\/therm/);
						const marketMatch =
							marketText.match(/(\d+\.\d+)\/therm/);
						if (!fptMatch || !marketMatch) {
							throw new Error('Failed to parse Blended Rates');
						}
						const fpt = parseFloat(fptMatch[1]);
						const market = parseFloat(marketMatch[1]);
						return <BlendedOffer & OfferBase>{
							id: `blended-${o.term}`,
							name: 'Blended',
							term: Number(o.term),
							confirmationCode: o.confirmationCode,
							type: 'blended',
							offers: [
								[
									0.5,
									{
										type: 'fpt',
										rate: fpt,
									} as FixedPerThermOffer,
								],
								[
									0.5,
									{
										type: 'market',
										rate: market,
										market: Market.CIG,
									} as MarketOffer,
								],
							],
						};
					} else if (o.name === 'Index Rates') {
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
							id: `market-${o.term}`,
							name: 'Market Index',
							term: Number(o.term),
							confirmationCode: o.confirmationCode,
							type: 'market',
							market: Market.CIG,
							rate: cig,
						};
					}
				}),
		)
		.then((offers) => {
			// write to json file at path
			const path =
				'projects/bradkovach.github.io/src/app/routes/choice-gas/data/vendors/json/com.choosebhes.json';
			const json = JSON.stringify(offers, null, 2);
			fs.writeFileSync(path, json, 'utf-8');
		})
		.catch((err) => {
			console.error(err);
		});
}

run();
