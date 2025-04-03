import { Market } from '../Market';
import { Vendor } from '../../entity/Vendor';

export const uncleFrankEnergyServices = new Vendor(
	'com.unclefrankenergy',
	'Uncle Frank Energy Services',
	'https://www.unclefrankenergy.com',
	'8333726564',
)
	.addOffer({
		confirmationCode: '10500',
		id: 'index-1',
		market: Market.CIG,
		name: 'Variable Index Adder',
		rate: 0.3,
		term: 1,
		type: 'market',
	})
	.addOffer({
		confirmationCode: '10501',
		id: 'green-index-1',
		market: Market.CIG,
		name: 'Variable Green Index Adder',
		rate: 0.4,
		term: 1,
		type: 'market',
	})
	.addOffer({
		confirmationCode: '11500',
		id: 'fpt-1',
		name: 'Fixed 1 Year',
		rate: 1.12,
		term: 1,
		type: 'fpt',
	})
	.addOffer({
		confirmationCode: '11501',
		id: 'green-fpt-1',
		name: 'Fixed Green 1 Year',
		rate: 1.22,
		term: 1,
		type: 'fpt',
	});
