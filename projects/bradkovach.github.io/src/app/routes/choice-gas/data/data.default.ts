import type { Charge } from '../entity/Charge';
import type { FixedArray } from '../entity/FixedArray';

import { ChargeType } from '../entity/ChargeType';
import { currentCigRate, currentGcaRate } from './data.current';
import { Market } from './Market';

export enum Series {
	CIG = Market.CIG,
	GCA = Market.GCA,
	Usage,
	TemperatureHigh,
	TemperatureLow,
}

export const SeriesLabels: Record<Series, string> = {
	[Series.CIG]: 'CIG',
	[Series.GCA]: 'GCA',
	[Series.TemperatureHigh]: 'High Temp',
	[Series.TemperatureLow]: 'Low Temp',
	[Series.Usage]: 'Therm Usage',
};

export const SeriesKeys = Object.keys(SeriesLabels) as unknown as Series[];

export const seriesDefaults: Record<Series, FixedArray<number, 12>> = {
	[Series.CIG]: Array(12).fill(currentCigRate) as FixedArray<number, 12>,
	[Series.GCA]: Array(12).fill(currentGcaRate) as FixedArray<number, 12>,
	[Series.TemperatureHigh]: [34, 36, 44, 51, 62, 73, 80, 79, 70, 57, 43, 34],
	[Series.TemperatureLow]: [8, 11, 18, 24, 33, 42, 47, 44, 36, 26, 16, 9],
	// 2024: [144,118,77,107,56,30,15,6,31,64,78,116] // my fr usage
	// 2025: [144,118,77,81,55,15,9,7,7,10,85,115] // my fr usage
	[Series.Usage]: [144, 118, 77, 81, 55, 15, 9, 7, 7, 10, 85, 115],
};

export const defaultCharges: Charge[] = [
	{
		name: 'Volumetric Charge',
		rate: 0.2008,
		type: ChargeType.PerTherm,
	},
	{
		name: 'EE Surcharge',
		rate: 0.0074,
		type: ChargeType.PerTherm,
	},
	{
		name: 'Franchise Fee',
		rate: 0.0225,
		type: ChargeType.PerTherm,
	},
	{
		name: 'Customer Charge',
		rate: 33,
		type: ChargeType.PerMonth,
	},
	{
		name: 'Revenue Adjustment Charge',
		rate: -0.0123,
		type: ChargeType.PerTherm,
	},
	{
		name: 'WY Integrity Rider',
		rate: 0.0106,
		type: ChargeType.PerTherm,
	},

	{ name: 'State Sales Tax', rate: 0.04, type: ChargeType.Tax },
	{ name: 'County Sales Tax', rate: 0.01, type: ChargeType.Tax },
	{ name: 'Special County Option Tax', rate: 0.01, type: ChargeType.Tax },
];
