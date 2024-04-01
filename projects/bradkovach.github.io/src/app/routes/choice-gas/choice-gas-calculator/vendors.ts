import { Vendor } from '../entity/Vendor';
import { Market } from './Market';

export const vendors: Vendor[] = [
	// /vendors/org.wyomingcommunitygas/1-fpt
	new Vendor('org.wyomingcommunitygas', 'Wyoming Community Gas').addOffer({
		id: '1-fpt',
		type: 'fpt',
		term: 1,
		name: 'Fixed Rate Per Therm',
		rate: 0.598,
	}),
	new Vendor('com.vistaenergymarketing', 'Vista Energy Marketing')
		.addOffer({
			id: '1-fpm',
			name: 'Go Pokes Fixed Bill (Fixed Monthly Bill)',
			term: 1,
			type: 'fpm',
			rate: 121.5,
		})
		.addOffer({
			id: '2-fpm',
			name: 'Go Pokes Fixed Bill (Fixed Monthly Bill)',
			term: 2,
			type: 'fpm',
			rate: 125.49,
		})
		.addOffer({
			id: '1-fpt',
			name: 'Go Pokes Fixed Price',
			term: 1,
			type: 'fpt',
			rate: 0.465,
		})
		.addOffer({
			id: '2-fpt',
			name: 'Go Pokes Fixed Price',
			term: 2,
			type: 'fpt',
			rate: 0.5,
		})
		.addOffer({
			id: '1-index',
			name: 'Go Pokes Index Price',
			term: 1,
			type: 'market',
			market: Market.CIG,
			rate: 0.09,
		})
		.addOffer({
			id: '2-index',
			name: 'Go Pokes Index Price',
			term: 2,
			type: 'market',
			market: Market.CIG,
			rate: 0.089,
		})
		.addOffer({
			id: '1-gca',
			name: 'Guaranteed Lower than the Gas Cost Adjustment',
			term: 1,
			type: 'market',
			market: Market.GCA,
			rate: -0.001,
		})
		.addOffer({
			id: '2-gca',
			name: 'Guaranteed Lower than the Gas Cost Adjustment',
			term: 2,
			type: 'market',
			market: Market.GCA,
			rate: -0.002,
		}),
	// new Vendor('Symmetry Energy Solutions')
	// 	.addOffer({
	// 		name: 'Fixed Rate Per Therm',
	// 		term: 1,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Fixed Rate Per Therm',
	// 		term: 2,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate',
	// 		term: 1,
	// 		type: 'index',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate',
	// 		term: 2,
	// 		type: 'index',
	// 		rate: 0,
	// 	})
	// 	.addOffer({ name: 'Managed', term: 1, type: 'index', rate: 0 }),
	// new Vendor('Black Hills Energy Services')
	// 	.addOffer({ name: 'WinterGuard', term: 1, type: 'fpm', rate: 0 })
	// 	.addOffer({ name: 'WinterGuard', term: 2, type: 'fpm', rate: 0 })
	// 	.addOffer({
	// 		name: 'Fixed Rate Per Therm',
	// 		term: 1,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Fixed Rate Per Therm',
	// 		term: 2,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate',
	// 		term: 1,
	// 		type: 'index',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate',
	// 		term: 2,
	// 		type: 'index',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Blended Smart Rate',
	// 		term: 1,
	// 		type: 'bestOf',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Blended Smart Rate',
	// 		term: 2,
	// 		type: 'bestOf',
	// 		rate: 0,
	// 	}),
	// new Vendor('WoodRiver Energy, LLC')
	// 	.addOffer({
	// 		name: 'Secure Fixed Rate (Fixed Monthly Bill)',
	// 		term: 1,
	// 		type: 'fpm',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Secure Fixed Rate (Fixed Monthly Bill)',
	// 		term: 2,
	// 		type: 'fpm',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Guaranteed Fixed Rate Per Therm',
	// 		term: 1,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Guaranteed Fixed Rate Per Therm',
	// 		term: 2,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Guaranteed Index',
	// 		term: 1,
	// 		type: 'index',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Guaranteed Index',
	// 		term: 2,
	// 		type: 'index',
	// 		rate: 0,
	// 	}),
	// new Vendor('Archer Energy, LLC'),
	// new Vendor('Uncle Frank Energy Services')
	// 	.addOffer({
	// 		name: 'Fixed Rate Per Therm',
	// 		term: 1,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Fixed Rate Green Gas',
	// 		term: 1,
	// 		type: 'fpm',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate',
	// 		term: 1,
	// 		type: 'index',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate Green Gas',
	// 		term: 1,
	// 		type: 'index',
	// 		rate: 0,
	// 	}),
	// new Vendor('Wyoming Producer-Consumer Alliance')
	// 	.addOffer({
	// 		name: 'Fixed Rate Per Therm',
	// 		term: 1,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate',
	// 		term: 1,
	// 		type: 'index',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Index With a Cap',
	// 		term: 1,
	// 		type: 'bestOf',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Blended Rate',
	// 		term: 1,
	// 		type: 'blended',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Fixed Rate Per Therm',
	// 		term: 2,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate',
	// 		term: 2,
	// 		type: 'index',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Index With a Cap',
	// 		term: 2,
	// 		type: 'bestOf',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Blended Rate',
	// 		term: 2,
	// 		type: 'blended',
	// 		rate: 0,
	// 	}),
	// new Vendor('Wyoming Community Gas')
	// 	.addOffer({ name: 'Budget Assist', term: 1, type: 'fpm', rate: 0 })
	// 	.addOffer({
	// 		name: 'Fixed Rate Per Therm',
	// 		term: 1,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate',
	// 		term: 1,
	// 		type: 'index',
	// 		rate: 0,
	// 	})
	// 	.addOffer({ name: 'Budget Assist', term: 2, type: 'fpm', rate: 0 })
	// 	.addOffer({
	// 		name: 'Fixed Rate Per Therm',
	// 		term: 2,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate',
	// 		term: 2,
	// 		type: 'index',
	// 		rate: 0,
	// 	}),
	// new Vendor('Legacy Natural Gas')
	// 	.addOffer({
	// 		name: 'Fixed Monthly Bill',
	// 		term: 1,
	// 		type: 'fpm',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Fixed Rate Per Therm',
	// 		term: 1,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate',
	// 		term: 1,
	// 		type: 'index',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Fixed Monthly Bill',
	// 		term: 2,
	// 		type: 'fpm',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Fixed Rate Per Therm',
	// 		term: 2,
	// 		type: 'fpt',
	// 		rate: 0,
	// 	})
	// 	.addOffer({
	// 		name: 'Market Index Rate',
	// 		term: 2,
	// 		type: 'index',
	// 		rate: 0,
	// 	}),
	// new Vendor('Black Hills Wyoming Gas, LLC').addOffer({
	// 	name: 'Gas Cost Adjustment (GCA) Regulated Rate',
	// 	term: 1,
	// 	type: 'gca',
	// 	rate: 0,
	// }),
];
