import type {
	FixedPerMonthOffer,
	FixedPerThermOffer,
	MarketOffer,
	Offer,
	OfferBase,
} from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

import * as cheerio from 'cheerio';

import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/Market';
import { getEnvAsync } from '../getEnvAsync';

export const run = (): Promise<Offer[]> =>
	getEnvAsync('BHE_PREMISE_ID').then((premiseId) =>
		fetch(
			'https://customers.vistaenergymarketing.com/AccountDetail/NavigateToAccountDetail_Customerv2',
			{
				body: 'submitButtonParamValue=' + premiseId,
				credentials: 'include',
				headers: {
					Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
					'Accept-Language': 'en-US,en;q=0.5',
					'Cache-Control': 'no-cache',
					'Content-Type': 'application/x-www-form-urlencoded',
					Pragma: 'no-cache',
					'Sec-Fetch-Dest': 'document',
					'Sec-Fetch-Mode': 'navigate',
					'Sec-Fetch-Site': 'same-origin',
					'Upgrade-Insecure-Requests': '1',
					'User-Agent':
						'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
				},
				method: 'POST',
				mode: 'cors',
				referrer:
					'https://customers.vistaenergymarketing.com/KioskSearch/ExecuteSearch',
			},
		)
			.then((response) => response.text())
			.then((html) => cheerio.load(html))
			.then(($) =>
				$(
					'form[action=/AccountDetail/UpdatePricing] .card-grid-product',
				)
					.toArray()
					.map((product: cheerio.Element): Offer => {
						const $product = $(product);

						// year and cc in .uk-card-header.uk-text-center.uk-text-bold
						// '1yr - xxxxx'
						//  ~     ~~~~~
						const termAndConfirmationCodeText = $product
							.find('.uk-card-header.uk-text-center.uk-text-bold')
							.text();

						// price text in .product_price
						const priceText = $product
							.find('.product_price')
							.text();

						// offer type from .product_uom
						const typeText = $product.find('.product_uom').text();

						const [termText, confirmationCode] =
							termAndConfirmationCodeText.split(' - ');

						// term is the first number found in the term text
						const term = Number(termText[0]);

						if ('per month' === typeText) {
							// price starts with $ and ends with numeric price
							return {
								confirmationCode,
								id: `fpm-${term}`,
								name: 'Go Pokes Fixed Bill',
								// rate: Number(priceText.slice(1)),
								rate: 0,
								term,
								type: 'fpm',
							} as FixedPerMonthOffer & OfferBase;
						} else if (
							'per therm' === typeText &&
							priceText.startsWith('+') &&
							priceText.endsWith('¢')
						) {
							// price starts with +x.yy and ends with cent character
							return {
								confirmationCode,
								id: `index-${term}`,
								market: Market.CIG,
								name: 'Go Pokes Index Price',
								// cents to dollars
								rate:
									Number(
										priceText
											.slice(0, -1)
											.split('.')
											.join(''),
									) / 1000,
								term,
								type: 'market',
							} as MarketOffer & OfferBase;
						} else if ('per therm' === typeText) {
							// price is cents in decimal followed by cents character
							// rate = priceWithoutCents / 100
							return {
								confirmationCode,
								id: `fpt-${term}`,
								name: 'Go Pokes Fixed Price',
								rate:
									Number(
										priceText
											.slice(0, -1)
											.split('.')
											.join(''),
									) / 1000,
								term,
								type: 'fpt',
							} as FixedPerThermOffer & OfferBase;
						} else if ('price varies' === typeText) {
							// the GLTGCA is a market rate of the GCA mkt - 0.01
							return {
								confirmationCode,
								id: `gltgca-${term}`,
								market: Market.GCA,
								name: 'Guaranteed Lower Than Gas Cost Adjustment',
								rate: -0.01,
								term,
								type: 'market',
							} as MarketOffer & OfferBase;
						} else {
							throw new Error(`Unknown offer type: ${typeText}`);
						}
					}),
			),
	);
