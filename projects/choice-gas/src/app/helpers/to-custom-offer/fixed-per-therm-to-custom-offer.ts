import type { CustomOffer } from '../../schema/custom-offer.z';
import type { FixedPerThermOffer } from '../../schema/fixed-per-therm-offer.z';

export const fptOfferToCustomOffer = (
	offer: FixedPerThermOffer,
): CustomOffer => ({
	coefTherm: offer.rate,
	id: offer.id,
	name: offer.name,
	term: offer.term,
	type: 'custom',
});
