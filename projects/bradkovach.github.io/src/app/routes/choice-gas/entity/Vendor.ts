import { IVendor } from './IVendor';
import { Offer } from './Offer';

export class Vendor implements IVendor {
	id: string;
	name: string;
	offers: Map<string, Offer> = new Map<string, Offer>();

	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}

	addOffer(offer: Offer, replace: boolean = false): this {
		if (this.offers.has(offer.id) && !replace) {
			throw new Error(`Offer with id ${offer.id} already exists`);
		}
		this.offers.set(offer.id, { vendor_id: this.id, ...offer });
		return this;
	}

	getOffersArray(): Offer[] {
		return Array.from(this.offers.values());
	}
}
