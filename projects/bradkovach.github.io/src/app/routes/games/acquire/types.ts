export enum Chain {
  Sackson,
  Tower,
  Worldwide,
  American,
  Festival,
  Continental,
  Imperial,
}

// These are offsets that can be used in the lookup table
export enum Schedule {
  Threshold = 0,
  Tier1 = 1,
  Tier2 = 2,
  Tier3 = 3,
}

export enum Screen {
  Balances,
  NetWorth,
  Schedules,
}

export enum SharePriceTier {
  Tier1 = Schedule.Tier1,
  Tier2 = Schedule.Tier2,
  Tier3 = Schedule.Tier3,
}

export interface Balance extends Record<Chain, number> {
  [Chain.American]: number;
  [Chain.Continental]: number;
  [Chain.Festival]: number;
  [Chain.Imperial]: number;
  [Chain.Sackson]: number;
  [Chain.Tower]: number;
  [Chain.Worldwide]: number;
  cash: number;
}

export interface Player extends Balance {
  name: string;
}

export interface Transaction extends Balance {
  creditIdx: number;
  debitIdx: number;
}
