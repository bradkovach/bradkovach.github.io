import { Injectable } from '@angular/core';
import { Market } from './choice-gas-calculator/Market';
import { thermUsageDefaults } from './choice-gas-calculator/choice-gas-calculator.component';
import { Charge } from './entity/Charge';
import { ChargeType } from './entity/ChargeType';
import { FixedArray } from './entity/FixedArray';

@Injectable({
	providedIn: 'root',
})
export class DataService {
	constructor() {}

	// _usage: FixedArray<number, 12> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	get usage(): FixedArray<number, 12> {
		let usage = localStorage.getItem('usage');
		if (usage === null) {
			this.usage = thermUsageDefaults;
			return thermUsageDefaults;
		}
		return JSON.parse(usage) as FixedArray<number, 12>;
	}

	set usage(value: FixedArray<number, 12>) {
		localStorage.setItem('usage', JSON.stringify(value));
	}

	get charges(): Charge[] {
		let charges = localStorage.getItem('charges');
		if (charges === null) {
			const charges = [
				{
					name: 'Customer Charge',
					rate: 33,
					type: ChargeType.PerMonth,
				},
				{ name: 'State Sales Tax', rate: 0.06, type: ChargeType.Tax },
				{ name: 'County Sales Tax', rate: 0.01, type: ChargeType.Tax },
			];

			this.charges = charges;
			return charges;
		}
		return JSON.parse(charges) as Charge[];
	}

	set charges(value: Charge[]) {
		localStorage.setItem('charges', JSON.stringify(value));
	}

	get rates(): Record<Market, number> {
		let rates = localStorage.getItem('rates');
		if (rates === null) {
			const rates = {
				[Market.CIG]: 0.5,
				[Market.GCA]: 0.5,
			};
			this.rates = rates;

			return rates;
		}
		return JSON.parse(rates) as Record<Market, number>;
	}

	set rates(rates: Record<Market, number>) {
		localStorage.setItem('rates', JSON.stringify(rates));
	}
}
