import type { AnyOffer } from '../schema/offer.z';

export interface IVendor {
	id: string;
	name: string;
	offers: Map<string, AnyOffer>;
}
export class Vendor implements IVendor {
	offers: Map<string, AnyOffer> = new Map<string, AnyOffer>();

	constructor(
		public id: string,
		public name: string,
		public website: string,
		public phone: string,
		public automated = false,
	) {}

	addOffer(offer: AnyOffer, replace = false): this {
		if (this.offers.has(offer.id) && !replace) {
			throw new Error(
				`Vendor ${this.name} Offer with id ${offer.id} already exists`,
			);
		}
		this.offers.set(offer.id, { vendor_id: this.id, ...offer });
		return this;
	}

	getOffersArray(): AnyOffer[] {
		return Array.from(this.offers.values());
	}
}
