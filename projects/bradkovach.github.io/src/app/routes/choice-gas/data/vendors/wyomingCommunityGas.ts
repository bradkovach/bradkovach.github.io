import { Vendor } from '../../entity/Vendor';
import { Market } from '../data.current';

export const wyomingCommunityGas = new Vendor(
	'org.wyomingcommunitygas',
	'Wyoming Community Gas',
	'https://wyomingcommunitygas.org',
	'8773184051',
);

wyomingCommunityGas
	.addOffer({
		id: 'fpt-1',
		type: 'fpt',
		name: 'Fixed',
		term: 1,
		rate: 0.448,
	})
	.addOffer({
		id: 'fpt-2',
		type: 'fpt',
		name: 'Fixed',
		term: 2,
		rate: 0.479,
	})
	.addOffer({
		id: 'fpm-1',
		type: 'fpm',
		name: 'Budget Assist',
		rate: 0,
		term: 1,
	})
	.addOffer({
		id: 'fpm-2',
		type: 'fpm',
		name: 'Budget Assist',
		rate: 0,
		term: 2,
	})
	.addOffer({
		id: 'index-1',
		type: 'market',
		name: 'Index',
		term: 1,
		market: Market.CIG,
		rate: 0.102,
	})
	.addOffer({
		id: 'index-2',
		type: 'market',
		name: 'Index',
		term: 2,
		market: Market.CIG,
		rate: 0.103,
	});
