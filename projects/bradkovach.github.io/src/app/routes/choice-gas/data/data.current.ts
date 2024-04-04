export const currentCigRate = 0.15;

export const currentGcaRate = 0.3692;

export enum Market {
  CIG,
  GCA,
}

export const marketLabels: Record<Market, string> = {
  [Market.CIG]: 'CIG',
  [Market.GCA]: 'GCA',
};
