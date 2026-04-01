import type { CustomOffer } from '../../schema/custom-offer.z';
import type { FixedPerMonthOffer } from '../../schema/fixed-per-month.z';
import type { OfferBase } from '../../schema/offer-base.z';

export const fpmOfferToCustomOffer = (
	offer: FixedPerMonthOffer & OfferBase,
): CustomOffer => ({
	addendMonth: offer.rate,
	id: offer.id,
	name: offer.name,
	term: offer.term,
	type: 'custom',
});
