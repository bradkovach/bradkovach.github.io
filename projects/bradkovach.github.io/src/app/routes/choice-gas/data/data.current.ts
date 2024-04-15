export const currentCigRate = 0.15;

import gasCostAdjustment from './vendors/json/gas-cost-adjustment.json';

export const currentGcaRate = gasCostAdjustment as number;

export enum Market {
	CIG,
	GCA,
}

export const marketLabels: Record<Market, string> = {
	[Market.CIG]: 'CIG',
	[Market.GCA]: 'GCA',
};

export const Markets = Object.keys(marketLabels) as unknown as Market[];
