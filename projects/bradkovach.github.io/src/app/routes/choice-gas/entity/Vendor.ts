import type { Offer } from './Offer';

export interface IVendor {
	id: string;
	name: string;
	offers: Map<string, Offer>;
}
export class Vendor implements IVendor {
	offers: Map<string, Offer> = new Map<string, Offer>();

	constructor(
		public id: string,
		public name: string,
		public website: string,
		public phone: string,
		public automated = false,
	) {
		this.id = id;
		this.name = name;
	}

	addOffer(offer: Offer, replace = false): this {
		if (this.offers.has(offer.id) && !replace) {
			throw new Error(
				`Vendor ${this.name} Offer with id ${offer.id} already exists`,
			);
		}
		this.offers.set(offer.id, { vendor_id: this.id, ...offer });
		return this;
	}

	getOffersArray(): Offer[] {
		return Array.from(this.offers.values());
	}
}
