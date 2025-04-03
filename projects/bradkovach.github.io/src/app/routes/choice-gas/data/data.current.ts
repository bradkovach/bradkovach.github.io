export const currentCigRate = 0.37;

import type { FixedPerThermOffer } from '../entity/Offer';

import { Market } from './Market';
import gasCostAdjustment from './vendors/json/com.choicegas.json';

const [offer] = gasCostAdjustment as FixedPerThermOffer[];
export const currentGcaRate = offer?.rate ?? 0;

export const marketLabels: Record<Market, string> = {
	[Market.CIG]: 'CIG',
	[Market.GCA]: 'GCA',
};

export const Markets = Object.keys(marketLabels) as unknown as Market[];
