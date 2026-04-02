import type { CustomOffer } from '../../schema/custom-offer.z';
import type { MarketOffer } from '../../schema/market-offer.z';

export const marketOfferToCustomOffer = (offer: MarketOffer): CustomOffer => ({
	addendRate: offer.rate,
	coefRate: 1,
	id: offer.id,
	market: offer.market,
	name: offer.name,
	term: offer.term,
	type: 'custom',
});
