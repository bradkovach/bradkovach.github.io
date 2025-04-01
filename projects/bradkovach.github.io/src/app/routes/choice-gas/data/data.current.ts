export const currentCigRate = 0.15;

import { MarketOffer } from '../entity/Offer';
import gasCostAdjustment from './vendors/json/gas-cost-adjustment.json';

const [offer] = gasCostAdjustment as MarketOffer[];
export const currentGcaRate = offer.rate ?? 0;

export enum Market {
	CIG,
	GCA,
}

export const marketLabels: Record<Market, string> = {
	[Market.CIG]: 'CIG',
	[Market.GCA]: 'GCA',
};

export const Markets = Object.keys(marketLabels) as unknown as Market[];
