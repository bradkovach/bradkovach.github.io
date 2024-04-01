import { Offer } from './Offer';

export interface IVendor {
	id: string;
	name: string;
	offers: Map<string, Offer>;
}
