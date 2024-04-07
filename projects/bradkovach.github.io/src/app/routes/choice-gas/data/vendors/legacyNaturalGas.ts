import { Vendor } from '../../entity/Vendor';
import { Market } from '../data.current';

export const legacyNaturalGas = new Vendor(
	'com.legacynaturalgas.www',
	'Legacy Natural Gas',
	'https://www.legacynaturalgas.com',
	'8884528231',
)
	.addOffer({
		id: 'fpt-1',
		type: 'fpt',
		name: 'Fixed Price',
		term: 1,
		rate: 0.425,
		confirmationCode: '20056',
	})
	.addOffer({
		id: 'fpt-2',
		type: 'fpt',
		name: 'Fixed Price',
		term: 2,
		rate: 0.455,
		confirmationCode: '20157',
	})
	.addOffer({
		id: 'market-1',
		type: 'market',
		market: Market.CIG,
		name: 'Market Index',
		rate: 0.095,
		confirmationCode: '20340',
		term: 1,
	})

	.addOffer({
		id: 'market-2',
		type: 'market',
		market: Market.CIG,
		name: 'Market Index',
		rate: 0.095,
		confirmationCode: '20440',
		term: 2,
	})
	.addOffer({
		id: 'fpm-1',
		type: 'fpm',
		name: 'Fixed Bill',
		rate: 0,
		term: 1,
		confirmationCode: '20631',
	})
	.addOffer({
		id: 'fpm-2',
		type: 'fpm',
		name: 'Fixed Bill',
		rate: 0,
		term: 2,
		confirmationCode: '20649',
	});
