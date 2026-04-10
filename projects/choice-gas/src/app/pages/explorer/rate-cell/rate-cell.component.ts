import { Component, input, Pipe, type PipeTransform } from '@angular/core';

import type { AnyOffer, AnyOfferSansBase } from '../../../schema/offer.z';

import { marketLabels } from '../../../data/data.current';

@Pipe({
	name: 'rateDetail',
	pure: true,
	standalone: true,
})
export class RateDetailPipe implements PipeTransform {
	transform(offer: AnyOfferSansBase, prepend = '- '): string {
		switch (offer.type) {
			case 'best':
				return [
					`Best Of:`,
					...offer.offers
						.map((o) =>
							this.transform(o, '  ' + prepend)
								.split('\n')
								.join('\n  '),
						)
						.map((s) => `${prepend}${s}`),
				].join('\n');
			case 'blended': {
				const sumOfWeights = offer.offers.reduce(
					(sum, [weight]) => sum + weight,
					0,
				);
				return [
					'Blend of Rates:',
					...offer.offers.map(([weight, offer]) => {
						const subofferDetail = this.transform(offer, '')
							.split('\n')
							.join('\n    ');
						const pct = (weight / sumOfWeights) * 100;
						return `${prepend}${subofferDetail} (${pct.toFixed(2)}%)`;
					}),
				].join('\n');
			}
			case 'fpm':
				return `$${offer.rate.toFixed(4)}/month`;
			case 'fpt':
				return `$${offer.rate.toFixed(4)}/therm`;
			case 'market': {
				const marketLabel = marketLabels[offer.market];
				const plusOrMinus = offer.rate < 0 ? '-' : '+';
				return `${marketLabel} ${plusOrMinus} $${Math.abs(offer.rate).toFixed(4)}`;
			}
		}

		return '';
	}
}

@Pipe({
	name: 'rateSummary',
	pure: true,
	standalone: true,
})
export class RateSummaryPipe implements PipeTransform {
	transform(offer: AnyOfferSansBase): string {
		switch (offer.type) {
			case 'best':
				return 'Best of...';
			case 'blended': {
				return 'Blended';
			}
			case 'fpm': {
				if (offer.rate === 0) {
					return '- - -';
				}
				return `$${offer.rate.toFixed(4)}/month`;
			}
			case 'fpt':
				return `$${offer.rate.toFixed(4)}/therm`;
			case 'market': {
				const marketLabel = marketLabels[offer.market];
				const plusOrMinus = offer.rate < 0 ? '-' : '+';
				return `${marketLabel} ${plusOrMinus} $${Math.abs(offer.rate).toFixed(4)}`;
			}
		}

		return '';
	}
}

@Component({
	imports: [RateDetailPipe, RateSummaryPipe],
	selector: 'td[rateCell], th[rateCell]',
	styles: `
		.has-tooltip {
			border-bottom: 1px dashed currentColor;
			cursor: help;
		}
	`,
	template: `
		@let Offer = offer();
		<span title="{{ Offer | rateDetail }}" class="has-tooltip">
			{{ Offer | rateSummary }}
		</span>
	`,
})
export class RateCell {
	readonly offer = input.required<AnyOffer>();
}
