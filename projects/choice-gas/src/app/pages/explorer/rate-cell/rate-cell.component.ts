import { Component, input, Pipe, type PipeTransform } from '@angular/core';
import { RouterLink } from '@angular/router';

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
				if (!offer.rate) {
					return '- - -';
				}
				return `$${offer.rate.toFixed(2)}/month`;
			case 'fpt':
				return `$${offer.rate.toFixed(3)}/therm`;
			case 'market': {
				const marketLabel = marketLabels[offer.market];
				const plusOrMinus = offer.rate < 0 ? '-' : '+';
				return `${marketLabel} ${plusOrMinus} $${Math.abs(offer.rate).toFixed(3)}`;
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
				if (!offer.rate) {
					return '- - -';
				}
				return `$${offer.rate.toFixed(2)}/month`;
			}
			case 'fpt':
				return `$${offer.rate.toFixed(3)}/therm`;
			case 'market': {
				const marketLabel = marketLabels[offer.market];
				const plusOrMinus = offer.rate < 0 ? '-' : '+';
				return `${marketLabel} ${plusOrMinus} $${Math.abs(offer.rate).toFixed(3)}`;
			}
		}

		return '';
	}
}

@Component({
	imports: [RateDetailPipe, RateSummaryPipe, RouterLink],
	selector: 'td[rateCell], th[rateCell]',
	styles: `
		.has-tooltip {
			border-bottom: 1px dashed currentColor;
			cursor: help;
		}
	`,
	template: `
		@let Offer = offer();
		@let detail = Offer | rateDetail;
		@let summary = Offer | rateSummary;
		@if (Offer.type === 'fpm' && !Offer.rate) {
			<a
				class="text-danger"
				[routerLink]="[
					'../vendors',
					Offer.vendor_id,
					'offers',
					Offer.id,
				]"
				>Edit Rate</a
			>
		} @else if (Offer.type === 'market' && Offer.rate == 0) {
			{{ marketLabels[Offer.market] }}
		} @else {
			<span title="{{ detail }}" [class.has-tooltip]="detail !== summary">
				{{ summary }}
			</span>
		}
	`,
})
export class RateCell {
	readonly marketLabels = marketLabels;
	readonly offer = input.required<AnyOffer>();
}
