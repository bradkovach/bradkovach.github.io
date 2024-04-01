import { Column, GameMode, Row } from './acquire.component';
import { Chain, Player } from './types';

interface Tile {
	row: Row;
	column: Column;
	occupied: boolean;
	chain: Chain | null;
}

type TileGenerator<T extends unknown> = (row: Row, column: Column) => T;

const getFalseBoard: TileGenerator<boolean> = () => false;

const rcToRaster = (row: Row, column: Column): number => {
	return row * 12 + column;
};

const toRaster = (tile: Tile, idx?: number, all?: Tile[]): number => {
	return rcToRaster(tile.row, tile.column);
};

export class AcquireEngine {
	private board: Tile[] = AcquireEngine.emptyBoardOf<Tile>((row, column) => {
		return {
			chain: null,
			column,
			occupied: false,
			row,
		};
	});

	// access with board[row][column]
	private boardChains: (Chain | null)[] =
		AcquireEngine.emptyBoardOf<Chain | null>(() => null);

	private boardOccupied: boolean[] = AcquireEngine.emptyBoardOf<boolean>();

	private gameMode: GameMode = GameMode.Classic;

	private isStarted: boolean = false;

	private players: Player[] = [];

	static emptyBoardOf<T extends any = boolean>(
		tileGenerator: TileGenerator<T> = getFalseBoard as TileGenerator<T>,
	): T[] {
		const board: T[] = [];
		for (let row = Row.A; row <= Row.I; row++) {
			for (let column = Column._1; column <= Column._12; column++) {
				board.push(tileGenerator(row, column));
			}
		}
		return board;
	}

	addPlayer(name: string): this {
		if (this.canAddPlayer()) {
			this.players.push({
				[Chain.American]: 0,
				[Chain.Continental]: 0,
				[Chain.Festival]: 0,
				[Chain.Imperial]: 0,
				[Chain.Sackson]: 0,
				[Chain.Tower]: 0,
				[Chain.Worldwide]: 0,
				cash: 6000,
				name,
			});
		}
		return this;
	}

	canAddPlayer(): boolean {
		return this.isStarted === false && this.players.length < 6;
	}

	canMergeChainsAt(
		left: Chain,
		right: Chain,
		row: Row,
		column: Column,
	): boolean;
	canMergeChainsAt(left: Chain, right: Chain, raster: number): boolean;
	canMergeChainsAt(
		left: Chain,
		right: Chain,
		rowOrRaster: Row | number,
		column?: Column,
	): boolean {
		const raster =
			arguments.length === 3
				? rowOrRaster
				: rcToRaster(rowOrRaster, column!);

		if (left === right) {
			return false;
		}

		const leftTiles = this.getChainTiles(left);
		const rightTiles = this.getChainTiles(right);

		if (leftTiles.length === 0 || rightTiles.length === 0) {
			return false;
		}

		// cannot merge if either chain already has >= 11 tiles
		if (leftTiles.length >= 11 || rightTiles.length >= 11) {
			return false;
		}

		return true;
	}

	canRemovePlayer(): boolean {
		return this.isStarted === false && this.players.length > 0;
	}

	/**
	 * Determines if a chain can be placed at the given raster index.
	 * @param raster board tile raster index
	 * @param chain Hotel chain to test
	 * @returns true if the chain can be placed at the given raster index
	 */
	canSetChainAt(chain: Chain, raster: number): boolean;
	canSetChainAt(chain: Chain, row: Row, column: Column): boolean;
	canSetChainAt(
		chain: Chain,
		rowOrRaster: Row | number,
		column?: Column,
	): boolean {
		// if three arguments, convert rc to raster
		const raster =
			arguments.length === 2
				? rowOrRaster
				: rcToRaster(rowOrRaster, column!);

		const tile = this.board[raster];

		// TODO: if chain is already on the board AND not contiguous, return false

		return tile.occupied === true && tile.chain === null;
	}

	// top top bottom is A-I
	canSetGameMode(): boolean {
		return this.isStarted === false;
	}

	canStartGame(): boolean {
		return (
			this.isStarted === false &&
			this.players.length > 1 &&
			this.players.length < 7 &&
			this.players.every((p) => p.name)
		);
	}

	getBoard() {
		return this.board;
	}

	getChainTiles(chain: Chain): Tile[] {
		const tile = this.board.find((t) => t.chain === chain);
		if (tile) {
			const raster = toRaster(tile);
			return this.getContiguous(raster);
		}
		return [];
	}

	/**
	 * Get all contiguous tiles from a given row and column; If there are no contiguous tiles, returns an empty array.
	 * @param {Row} row The row to start from.
	 * @param {Column} column The Column to start from.
	 * @returns {Tile[]} Array of contiguous tiles starting from Row,Column
	 */
	getContiguousRC(row: Row, column: Column): Tile[] {
		return this.getContiguous(rcToRaster(row, column));
	}

	/**
	 * Get all contiguous tiles from a given raster index; If there are no contiguous tiles, returns an empty array.
	 * @param {number} raster The raster index to start from.
	 * @param {boolean[]} visited Array of visited tiles; if omitted, it will initialize on its own.
	 * @returns {Tile[]} Array of contiguous tiles starting from the raster index
	 */
	getContiguous(
		raster: number,
		visited: boolean[] = AcquireEngine.emptyBoardOf(),
	): Tile[] {
		if (raster < 0 || raster > 108) {
			// we're off the board
			console.info(`off the board at ${raster}`);
			return [];
		}

		if (visited[raster] === true) {
			console.info(`already visited ${raster}`);
			// we've already been here
			return [];
		}

		visited[raster] = true;

		const tile = this.board[raster];
		const result: Tile[] = [];

		if (tile.occupied !== false) {
			console.info(
				`found a tile at ${Row[tile.row]}, ${Column[tile.column]}`,
			);
			result.push(
				tile,
				// left
				...this.getContiguous(raster - 1, visited),
				// right
				...this.getContiguous(raster + 1, visited),
				// up
				...this.getContiguous(raster - Row.I, visited),
				// down
				...this.getContiguous(raster + Row.I, visited),
			);
		}

		return result;
	}

	getTile(raster: number): Tile;
	getTile(row: Row, column: Column): Tile;
	getTile(rowOrRaster: Row | number, column?: Column): Tile {
		const raster =
			arguments.length === 2
				? rcToRaster(rowOrRaster as Row, column!)
				: (rowOrRaster as number);
		return this.board[raster];
	}

	placeTile(raster: number): this;
	placeTile(row: Row, column: Column): this;
	placeTile(rowOrRaster: Row | number, column?: Column): this {
		const raster =
			arguments.length === 2
				? rcToRaster(rowOrRaster as Row, column!)
				: (rowOrRaster as number);

		if (raster > 108 || raster < 0) {
			return this;
		} else {
			const tile = this.board[raster];
			tile.occupied = true;
			return this;
		}
	}

	// rcCanPlaceTile(row: Row, column: Column) {
	// 	const raster = rcToRaster(row, column);
	// 	const tile = this.board[raster];
	// 	return tile.occupied === false;
	// }

	// rcCanSetChainAt(row: Row, column: Column, chain: Chain) {
	// 	const raster = rcToRaster(row, column);
	// 	const tile = this.board[raster];
	// 	return tile.occupied === true && tile.chain === null;
	// }

	// rcGetBoard(): Tile[][] {
	// 	return [
	// 		this.board.slice(0, 12),
	// 		this.board.slice(12, 24),
	// 		this.board.slice(24, 36),
	// 		this.board.slice(36, 48),
	// 		this.board.slice(48, 60),
	// 		this.board.slice(60, 72),
	// 		this.board.slice(72, 84),
	// 		this.board.slice(84, 96),
	// 		this.board.slice(96, 108),
	// 	];
	// }

	removePlayer(playerIdx: number): this {
		if (this.canRemovePlayer()) {
			this.players.splice(playerIdx, 1);
		}
		return this;
	}

	setChainAt(chain: Chain, raster: number): this;
	setChainAt(chain: Chain, row: Row, column: Column): this;
	setChainAt(chain: Chain, rowOrRaster: Row | number, column?: Column): this {
		const raster =
			arguments.length === 2
				? rowOrRaster
				: rcToRaster(rowOrRaster as Row, column!);

		if (this.canSetChainAt(raster, chain)) {
			this.board[raster].chain = chain;
		}
		return this;
	}

	setGameMode(gameMode: GameMode): this {
		if (this.canSetGameMode()) {
			this.gameMode = gameMode;
		}
		return this;
	}

	startGame(): this {
		if (this.canStartGame()) {
			this.isStarted = true;
		}
		return this;
	}
}
