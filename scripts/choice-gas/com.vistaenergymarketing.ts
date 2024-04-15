import cheerio from 'cheerio';
import { Market } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/data/data.current';
import {
	FixedPerMonthOffer,
	FixedPerThermOffer,
	MarketOffer,
	Offer,
	OfferBase,
} from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

export function run(): Promise<Offer[]> {
	const premiseId = process.env.BHE_PREMISE_ID;
	if (!premiseId) {
		throw new Error('Missing BHE_PREMISE_ID');
	}
	return fetch(
		'https://customers.vistaenergymarketing.com/AccountDetail/NavigateToAccountDetail_Customerv2',
		{
			credentials: 'include',
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
				Pragma: 'no-cache',
				'Cache-Control': 'no-cache',
			},
			referrer:
				'https://customers.vistaenergymarketing.com/KioskSearch/ExecuteSearch',
			body: 'submitButtonParamValue=' + premiseId,
			method: 'POST',
			mode: 'cors',
		},
	)
		.then((response) => response.text())
		.then((html) => cheerio.load(html))
		.then(($) =>
			$('form[action=/AccountDetail/UpdatePricing] .card-grid-product')
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
					const priceText = $product.find('.product_price').text();

					// offer type from .product_uom
					const typeText = $product.find('.product_uom').text();

					const [termText, confirmationCode] =
						termAndConfirmationCodeText.split(' - ');

					// term is the first number found in the term text
					const term = Number(termText[0]);

					if ('per month' === typeText) {
						// price starts with $ and ends with numeric price
						return {
							id: `fpm-${term}`,
							name: 'Go Pokes Fixed Bill',
							type: 'fpm',
							// rate: Number(priceText.slice(1)),
							rate: 0,
							term,
							confirmationCode,
						} as FixedPerMonthOffer & OfferBase;
					} else if (
						'per therm' === typeText &&
						priceText.startsWith('+') &&
						priceText.endsWith('¢')
					) {
						// price starts with +x.yy and ends with cent character
						return {
							id: `index-${term}`,
							name: 'Go Pokes Index Price',
							type: 'market',
							term,
							market: Market.CIG,
							// cents to dollars
							rate:
								Number(
									priceText.slice(0, -1).split('.').join(''),
								) / 1000,
							confirmationCode,
						} as MarketOffer & OfferBase;
					} else if ('per therm' === typeText) {
						// price is cents in decimal followed by cents character
						// rate = priceWithoutCents / 100
						return {
							id: `fpt-${term}`,
							name: 'Go Pokes Fixed Price',
							type: 'fpt',
							rate:
								Number(
									priceText.slice(0, -1).split('.').join(''),
								) / 1000,
							term,
							confirmationCode,
						} as FixedPerThermOffer & OfferBase;
					} else if ('price varies' === typeText) {
						// the GLTGCA is a market rate of the GCA mkt - 0.01
						return {
							id: `gltgca-${term}`,
							name: 'Guaranteed Lower Than Gas Cost Adjustment',
							type: 'market',
							term,
							market: Market.GCA,
							rate: -0.01,
							confirmationCode,
						} as MarketOffer & OfferBase;
					} else {
						throw new Error(`Unknown offer type: ${typeText}`);
					}
				}),
		);
}
