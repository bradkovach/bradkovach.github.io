import { Charge } from '../entity/Charge';
import { ChargeType } from '../entity/ChargeType';
import { FixedArray } from '../entity/FixedArray';
import { Market, currentCigRate, currentGcaRate } from './data.current';

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
	[Series.Usage]: 'Therm Usage',
	[Series.TemperatureHigh]: 'High Temp',
	[Series.TemperatureLow]: 'Low Temp',
};

export const SeriesKeys = Object.keys(SeriesLabels) as unknown as Series[];

export const seriesDefaults: Record<Series, FixedArray<number, 12>> = {
	[Series.CIG]: Array(12).fill(currentCigRate) as FixedArray<number, 12>,
	[Series.GCA]: Array(12).fill(currentGcaRate) as FixedArray<number, 12>,
	[Series.Usage]: [120, 130, 120, 100, 80, 60, 50, 40, 50, 60, 80, 110],
	[Series.TemperatureHigh]: [34, 36, 44, 51, 62, 73, 80, 79, 70, 57, 43, 34],
	[Series.TemperatureLow]: [8, 11, 18, 24, 33, 42, 47, 44, 36, 26, 16, 9],
};

export const defaultCharges: Charge[] = [
	{
		name: 'Volumetric Charge',
		rate: 0.2008,
		type: ChargeType.PerTherm,
	},
	{
		name: 'EE Surcharge',
		rate: 0.0046,
		type: ChargeType.PerTherm,
	},
	{
		name: 'Customer Charge',
		rate: 33,
		type: ChargeType.PerMonth,
	},

	{ name: 'State Sales Tax', rate: 0.04, type: ChargeType.Tax },
	{ name: 'County Sales Tax', rate: 0.01, type: ChargeType.Tax },
]; // [144,118,77,107,56,30,15,6,31,64,78,116] // my fr usage

export const defaultUsage: FixedArray<number, 12> = [
	120, 130, 120, 100, 80, 60, 50, 40, 50, 60, 80, 110,
];
