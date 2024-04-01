import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import 'zone.js';
import { IntegerComponent } from '../../../components/integer/integer/integer.component';
import { AcquireEngine } from './AcquireEngine';
import { NetWorthPipe } from './net-worth/net-worth.pipe';
import {
	PriceBySchedulePipe,
	SharePriceRow,
} from './price-by-schedule/PriceBySchedulePipe';
import {
	Balance,
	Chain,
	Player,
	Schedule,
	Screen,
	SharePriceTier,
} from './types';

export enum GameMode {
	Classic,
	Tycoon,
}

export enum BonusTier {
	None,
	Primary,
	Secondary,
	Tertiary,
}

export enum Row {
	A,
	B,
	C,
	D,
	E,
	F,
	G,
	H,
	I,
}

export enum Column {
	_1,
	_2,
	_3,
	_4,
	_5,
	_6,
	_7,
	_8,
	_9,
	_10,
	_11,
	_12,
}

export const RowLabels: Record<Row, string> = {
	[Row.A]: 'A',
	[Row.B]: 'B',
	[Row.C]: 'C',
	[Row.D]: 'D',
	[Row.E]: 'E',
	[Row.F]: 'F',
	[Row.G]: 'G',
	[Row.H]: 'H',
	[Row.I]: 'I',
};

export const ColumnLabels: Record<Column, string> = {
	[Column._1]: '1',
	[Column._2]: '2',
	[Column._3]: '3',
	[Column._4]: '4',
	[Column._5]: '5',
	[Column._6]: '6',
	[Column._7]: '7',
	[Column._8]: '8',
	[Column._9]: '9',
	[Column._10]: '10',
	[Column._11]: '11',
	[Column._12]: '12',
};

@Component({
	imports: [
		...[CommonModule, FormsModule],
		...[IntegerComponent],
		...[PriceBySchedulePipe, NetWorthPipe],
	],
	selector: 'bk-games-acquire',
	standalone: true,
	styleUrls: ['./acquire.component.scss'],
	templateUrl: './acquire.component.html',
})
export class AcquireComponent {
	readonly BonusTier = BonusTier;

	readonly Chain = Chain;
	readonly Chains = [
		Chain.Sackson,
		Chain.Tower,
		Chain.Worldwide,
		Chain.Festival,
		Chain.American,
		Chain.Continental,
		Chain.Imperial,
	];
	readonly GameMode = GameMode;
	readonly Schedule = Schedule;
	readonly Screen = Screen;
	readonly Tier = SharePriceTier;

	bank: Player = {
		[Chain.American]: 25,
		[Chain.Continental]: 25,

		[Chain.Festival]: 25,
		[Chain.Imperial]: 25,
		[Chain.Sackson]: 25,
		[Chain.Tower]: 25,
		[Chain.Worldwide]: 25,
		cash: Number.POSITIVE_INFINITY,
		name: 'Bank',
	};

	// bonusByGameMode[gameMode][tier] = [threshold, primary, secondary, tertiary]
	readonly bonusByGameMode: Record<
		GameMode,
		Record<SharePriceTier, [number, number, number, number][]>
	> = {
		[GameMode.Classic]: {
			[SharePriceTier.Tier1]: [
				[2, 2000, 1000, 0],
				[3, 3000, 1500, 0],
				[4, 4000, 2000, 0],
				[5, 5000, 2500, 0],
				[6, 6000, 3000, 0],
				[11, 7000, 3500, 0],
				[21, 8000, 4000, 0],
				[31, 9000, 4500, 0],
				[41, 10000, 5000, 0],
			],
			[SharePriceTier.Tier2]: [
				[2, 3000, 1500, 0],
				[3, 4000, 2000, 0],
				[4, 5000, 2500, 0],
				[5, 6000, 3000, 0],
				[6, 7000, 3500, 0],
				[11, 8000, 4000, 0],
				[21, 9000, 4500, 0],
				[31, 10000, 5000, 0],
				[41, 11000, 5500, 0],
			],
			[SharePriceTier.Tier3]: [
				[2, 4000, 2000, 0],
				[3, 5000, 2500, 0],
				[4, 6000, 3000, 0],
				[5, 7000, 3500, 0],
				[6, 8000, 4000, 0],
				[11, 9000, 4500, 0],
				[21, 10000, 5000, 0],
				[31, 11000, 5500, 0],
				[41, 12000, 6000, 0],
			],
		},
		[GameMode.Tycoon]: {
			[SharePriceTier.Tier1]: [
				[2, 2000, 1500, 1000],
				[3, 3000, 2200, 1500],
				[4, 4000, 3000, 2000],
				[5, 5000, 3700, 2500],
				[6, 6000, 4200, 3000],
				[11, 7000, 5000, 3500],
				[21, 8000, 5700, 4000],
				[31, 9000, 6200, 4500],
				[41, 10000, 7000, 5000],
			],
			[SharePriceTier.Tier2]: [
				[2, 3000, 2200, 1500],
				[3, 4000, 3000, 2000],
				[4, 5000, 3700, 2500],
				[5, 6000, 4200, 3000],
				[6, 7000, 5000, 3500],
				[11, 8000, 5700, 4000],
				[21, 9000, 6200, 4500],
				[31, 10000, 7000, 5000],
				[41, 11000, 7700, 5500],
			],
			[SharePriceTier.Tier3]: [
				[2, 4000, 3000, 2000],
				[3, 5000, 3700, 2500],
				[4, 6000, 4200, 3000],
				[5, 7000, 5000, 3500],
				[6, 8000, 5700, 4000],
				[11, 9000, 6200, 4500],
				[21, 10000, 7000, 5000],
				[31, 11000, 7700, 5500],
				[41, 12000, 8200, 6000],
			],
		},
	};

	readonly chainToSchedule: Record<Chain, Schedule> = {
		[Chain.American]: Schedule.Tier2,
		[Chain.Continental]: Schedule.Tier3,
		[Chain.Festival]: Schedule.Tier2,
		[Chain.Imperial]: Schedule.Tier3,
		[Chain.Sackson]: Schedule.Tier1,
		[Chain.Tower]: Schedule.Tier1,
		[Chain.Worldwide]: Schedule.Tier2,
	};

	readonly colors: Record<Chain, string> = {
		[Chain.American]: '#4850a1',
		[Chain.Continental]: '#007bc3',
		[Chain.Festival]: '#009973',
		[Chain.Imperial]: '#e86328',
		[Chain.Sackson]: '#e6323c',
		[Chain.Tower]: '#f7a102',
		[Chain.Worldwide]: '#813f97',
	};

	credit: Balance = {
		[Chain.American]: 0,
		[Chain.Continental]: 0,
		[Chain.Festival]: 0,
		[Chain.Imperial]: 0,
		[Chain.Sackson]: 0,
		[Chain.Tower]: 0,
		[Chain.Worldwide]: 0,
		cash: 0,
	};

	creditIdx: number | null = null;

	debit: Balance = {
		[Chain.American]: 0,
		[Chain.Continental]: 0,
		[Chain.Festival]: 0,
		[Chain.Imperial]: 0,
		[Chain.Sackson]: 0,
		[Chain.Tower]: 0,
		[Chain.Worldwide]: 0,
		cash: 0,
	};

	debitIdx: number | null = null;

	readonly engine: AcquireEngine = new AcquireEngine();

	/**
	 * 2D lookup for prices
	 * - threshold
	 * - tier 1 price
	 * - tier 2 price
	 * - tier 3 price
	 */

	gameMode: GameMode = GameMode.Classic;

	name = 'Angular';

	// 2-d lookup table for prices
	/**
	 *
	 */

	players: Player[] = [];

	//prettier-ignore
	readonly scheduleByGameMode: Record<GameMode, SharePriceRow[]> = {
    [GameMode.Classic]: [
      [2,     200,    300,    400,    ],
      [3,     300,    400,    500,    ],
      [4,     400,    500,    600,    ],
      [5,     500,    600,    700,    ],
      [6,     600,    700,    800,    ],
      [11,    700,    800,    900,    ],
      [21,    800,    900,    1000,   ],
      [31,    900,    1000,   1100,   ],
      [41,    1000,   1100,   1200,   ],
    ],
    [GameMode.Tycoon]: [
      [2,     200,    300,    400,    ],
      [3,     300,    400,    500,    ],
      [4,     400,    500,    600,    ],
      [5,     500,    600,    700,    ],
      [6,     600,    700,    800,    ],
      [11,    700,    800,    900,    ],
      [21,    800,    900,    1000,   ],
      [31,    900,    1000,   1100,   ],
      [41,    1000,   1100,   1200,   ],
    ],
  };
	screen: Screen = Screen.Balances;

	showPrices: boolean = false;

	readonly sizes: Record<Chain, number> = {
		[Chain.American]: 0,
		[Chain.Continental]: 0,
		[Chain.Festival]: 0,
		[Chain.Imperial]: 0,
		[Chain.Sackson]: 0,
		[Chain.Tower]: 0,
		[Chain.Worldwide]: 0,
	};

	useExcelLayout: boolean = false;
	constructor() {
		this.addPlayer('Brad');
		this.addPlayer('Connor');
		this.addPlayer('Esther');

		this.engine.startGame();

		this.engine
			.placeTile(Row.A, Column._1)
			.placeTile(Row.B, Column._1)
			.placeTile(Row.C, Column._1)
			.placeTile(Row.D, Column._1)
			.setChainAt(Chain.Sackson, Row.A, Column._1);

		this.engine
			.placeTile(Row.A, Column._3)
			.placeTile(Row.B, Column._3)
			.placeTile(Row.C, Column._3)
			.placeTile(Row.D, Column._3)
			.setChainAt(Chain.American, Row.A, Column._3);

		this.engine.getContiguous(64, AcquireEngine.emptyBoardOf<boolean>());
	}

	addPlayer(name: string) {
		if (this.engine.canAddPlayer()) {
			this.engine.addPlayer(name);
		}
	}
	canStageProperty(playerIdx: number, property: Chain): boolean {
		const player = playerIdx == -1 ? this.bank : this.players[playerIdx];
		const playerQty = player[property];

		return playerQty > 0 && playerQty <= 3;
	}

	getPlayerBonus(
		player: Player,
		chain: Chain,
		bonusTier: BonusTier,
	): number[] {
		const shareholders = [...this.players]
			// only players with shares
			.filter((p) => p[chain] > 0)
			// sort by share count, descending
			.sort((a, b) => b[chain] - a[chain]);

		if (shareholders.length === 0) {
			return [];
		}

		const tierIndexes: Record<BonusTier, number> = {
			[BonusTier.None]: 0,
			[BonusTier.Primary]: 0,
			[BonusTier.Secondary]: 0,
			[BonusTier.Tertiary]: 0,
		};

		// Determine shareholder bonuses.  These are awarded by # of shares.
		// If more than one player has the same number of shares, they split the bonus at that tier.
		// If there are only primary shareholders, they get
		const bonusTiers = [
			BonusTier.Primary,
			BonusTier.Secondary,
			BonusTier.Tertiary,
		];
		const currentBonusTierIdx = 0;
		for (
			let shareholderIdx = 1;
			shareholderIdx < shareholders.length;
			shareholderIdx++
		) {}

		return [];
	}

	getTileColor(tileValue: Chain | null): string | null {
		if (!tileValue) {
			return null;
		}

		return this.colors[tileValue];
	}

	getTileLabel(rowIdx: number, colIdx?: number): string {
		const idxToRow = [
			Row.A,
			Row.B,
			Row.C,
			Row.D,
			Row.E,
			Row.F,
			Row.G,
			Row.H,
			Row.I,
		];
		const idxToCol = [
			Column._1,
			Column._2,
			Column._3,
			Column._4,
			Column._5,
			Column._6,
			Column._7,
			Column._8,
			Column._9,
			Column._10,
			Column._11,
			Column._12,
		];
		// if colIdx is undefined, we're using a raster scan
		if (colIdx === undefined) {
			const rasterIdx = rowIdx;
			const row = idxToRow[Math.floor(rasterIdx / 12)];
			const col = idxToCol[rasterIdx % 12];
			return `${RowLabels[row]}${ColumnLabels[col]}`;
		}

		return `${RowLabels[idxToRow[rowIdx]]}${
			ColumnLabels[idxToCol[colIdx]]
		}`;
	}

	placeTileRaster(tileIdx: number) {
		this.engine.placeTile(tileIdx);
	}

	removePlayer(playerIdx: number) {
		if (this.engine.canRemovePlayer()) {
			this.engine.removePlayer(playerIdx);
		}
	}

	stageCash(playerIdx: number, event: MouseEvent) {
		const coefficient = event.shiftKey ? 10 : 1;
		const amount = 100 * coefficient;

		console.log(`moving ${amount}`);
	}

	stageProperty(playerIdx: number, property: Chain, event: MouseEvent) {
		const coefficient = event.shiftKey ? 3 : 1;
		const player = playerIdx === -1 ? this.bank : this.players[playerIdx];
		const desired = 1 * coefficient;

		const available = player[property];
		const actual = Math.min(desired, available, 3);

		console.log(`moving ${desired} ${Chain[property]} from ${player.name}`);
	}
}
