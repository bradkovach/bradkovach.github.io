import type { CustomOffer } from '../../schema/custom-offer.z';
import type { FixedPerMonthOffer } from '../../schema/fixed-per-month.z';

export const fpmOfferToCustomOffer = (
	offer: FixedPerMonthOffer,
): CustomOffer => ({
	addendMonth: offer.rate ?? 0,
	id: offer.id,
	name: offer.name,
	term: offer.term,
	type: 'custom',
});
