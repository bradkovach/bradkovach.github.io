import { AsyncPipe, DatePipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
	Observable,
	ReplaySubject,
	map,
	share,
	shareReplay,
	startWith,
	switchMap,
	timer,
} from 'rxjs';
import { BoardOf } from '../../types/BoardOf';
import { Heckle } from '../../types/Heckle';
import { ArrayRowOf } from '../../types/RowOf';
import { StringPuzzle } from '../../types/StringPuzzle';
import { SymbolLevel } from '../../types/SymbolLevel';
import { SymbolMember } from '../../types/SymbolMember';
import { SymbolMemberRow } from '../../types/SymbolMemberRow';
import { SymbolPuzzle } from '../../types/SymbolPuzzle';
import { PuzzleHelpers } from '../helpers/puzzle-helpers';
import { ExclusiveRangePipe } from '../pipes/exclusive-range/exclusive-range.pipe';
import { PrintSymbolMembersPipe } from '../pipes/print-symbol-members/print-symbol-members.pipe';
import { EpochToDatePipe } from '../pipes/since-cnx-epoch/since-cnx-epoch.pipe';
import { TransitionGroupItemDirective } from '../transition-group/transition-group-item.directive';
import { TransitionGroupComponent } from '../transition-group/transition-group.component';

type PuzzleViewModel = {
	puzzle: StringPuzzle;
	heckle: Heckle;
	completedGroups: [string, SymbolLevel][];
	remainingTiles: string[];
	selected: Set<string>;
	mistakesRemaining: number;
};

const mapSet = <T, U>(set: Set<T>, fn: (item: T) => U): Set<U> => {
	const result = new Set<U>();
	set.forEach((item) => result.add(fn(item)));
	return result;
};

@Component({
	selector: 'app-puzzle',
	standalone: true,
	imports: [
		DatePipe,
		AsyncPipe,
		JsonPipe,
		NgFor,
		NgIf,
		TransitionGroupComponent,
		TransitionGroupItemDirective,
		RouterLink,
		PrintSymbolMembersPipe,
		ExclusiveRangePipe,
		EpochToDatePipe,
	],
	templateUrl: './puzzle.component.html',
	styleUrls: ['./puzzle.component.scss'],
})
export class PuzzleComponent {
	private readonly groupsAll = new Map<string, SymbolLevel>();
	private readonly groupsIncomplete = new Map<string, SymbolLevel>();
	private readonly guessHistory: Set<symbol>[] = [];
	// heckle = Heckle.None;
	private readonly heckleSubject = new ReplaySubject<Heckle>(Heckle.None);
	private readonly puzzleSubject = new ReplaySubject<StringPuzzle>(1);
	private readonly symbolMemberToLevel: Map<symbol, SymbolLevel> = new Map();

	readonly Heckle = Heckle;
	readonly groupsComplete = new Map<string, SymbolLevel>();
	readonly heckle$: Observable<Heckle> = this.heckleSubject.asObservable();
	readonly heckleAndReset$: Observable<Heckle> = this.heckle$.pipe(
		switchMap((current) =>
			timer(2000).pipe(
				map(() => Heckle.None),
				startWith(current),
			),
		),
		share(),
	);
	readonly puzzle$ = this.puzzleSubject.asObservable();
	readonly symbolPuzzle$: Observable<SymbolPuzzle> = this.puzzle$.pipe(
		map((puzzle) => {
			const symbolGroupEntries = Object.entries(puzzle.groups).map(
				([title, stringGroups]): [string, SymbolLevel] => [
					title,
					{
						level: stringGroups.level,
						members: stringGroups.members.map((member) => {
							return {
								symbol: Symbol(member),
								label: member,
							} as SymbolMember;
						}) as unknown as ArrayRowOf<SymbolMember>,
					},
				],
			);

			// next, shuffle the tiles, this way if a puzzle is all the same word, the tiles will be assigned symbols randomly.
			const remainingTiles = shuffleImmutable(
				symbolGroupEntries.flatMap(([, group]) => group.members),
			);

			const startingGroups: SymbolMemberRow[] = puzzle.startingGroups.map(
				(group) => {
					if (group.length !== 4) {
						throw Error(
							`starting group should be 4 tiles, but is ${group.length} tiles`,
						);
					}

					return group.map((tile): SymbolMember => {
						// find and remove a matching tile from remainingTile
						const matchingTileIdx = remainingTiles.findIndex(
							(remainingTile) => {
								return remainingTile.label === tile;
							},
						);

						const [matchingSymbolTile] = remainingTiles.splice(
							matchingTileIdx,
							1,
						);

						return matchingSymbolTile;
					}) as SymbolMemberRow;
				},
			);

			return {
				id: puzzle.id,
				groups: Object.fromEntries(symbolGroupEntries),
				startingGroups: startingGroups as BoardOf<SymbolMember>,
			};
		}),
		shareReplay(),
	);
	public readonly groupsSets: Record<string, Set<symbol>> = {};
	public readonly symbolPuzzle$$ = this.symbolPuzzle$
		.pipe(takeUntilDestroyed())
		.subscribe((puzzle) => {
			// set the date for the puzzle

			// populate initial groups
			Object.entries(puzzle.groups).forEach(([title, group]) => {
				this.groupsAll.set(title, group);
				this.groupsIncomplete.set(title, group);
				group.members.forEach((member) => {
					this.symbolMemberToLevel.set(member.symbol, group);
				});
				this.groupsSets[title] = new Set(
					group.members.map((member) => member.symbol),
				);
			});

			puzzle.startingGroups.forEach((group) => {
				group.forEach((member) => {
					this.tilesBySymbol.set(member.symbol, member);
					this.tilesAvailable.add(member.symbol);
				});
			});
		});
	readonly tilesAvailable: Set<symbol> = new Set();
	readonly tilesBySymbol: Map<symbol, SymbolMember> = new Map();
	readonly tilesSelected: Set<symbol> = new Set();

	puzzleDate: Date = new Date();

	@Input() set puzzle(puzzle: StringPuzzle) {
		console.log('Received puzzle; updating subject.');
		this.puzzleSubject.next(puzzle);
	}

	get mistakesRemaining() {
		const invalidGuesses = this.guessHistory.filter((guess) => {
			const [a, b, c, d] = [...guess];

			// if any group has all four tiles in it, this guess is invalid (return false)
			const isValidGuess = Object.keys(this.groupsSets).filter(
				(title) => {
					const groupSymbols = this.groupsSets[title];
					return (
						groupSymbols.has(a) &&
						groupSymbols.has(b) &&
						groupSymbols.has(c) &&
						groupSymbols.has(d)
					);
				},
			);

			return isValidGuess.length === 0;
		});

		return 4 - invalidGuesses.length;
	}

	asBase64(puzzle: SymbolPuzzle) {
		return PuzzleHelpers.toBase64(PuzzleHelpers.toStringPuzzle(puzzle));
	}

	deselectAll() {
		this.tilesSelected.clear();
	}

	getColor(idx: number) {
		if (idx > 3 || idx < 0) {
			throw Error(`There is no color for row ${idx}.`);
		}
		return [
			'#fdcb58', //yellow
			'#78b159', // green
			'#55acee', // blue
			'#aa8ed6', // purple
		][idx];
	}

	getEmoji(level: number) {
		if (level > 3 || level < 0) {
			throw Error(`There is no emoji for level ${level}.`);
		}
		return ['🟨', '🟩', '🟦', '🟪'][level];
	}

	setHeckle(heckle: Heckle) {
		this.heckleSubject.next(heckle);
	}

	shuffle() {
		const shuffled = shuffleImmutable([...this.tilesAvailable]);
		this.tilesAvailable.clear();
		shuffled.forEach((tile) => this.tilesAvailable.add(tile));
	}

	verdict(
		heckle: Heckle,
		clearSelections: boolean = false,
		logHistory: boolean = false,
	) {
		this.heckleSubject.next(heckle);
		if (logHistory) {
			this.guessHistory.push(new Set(this.tilesSelected));
		}
		if (clearSelections) {
			this.tilesSelected.clear();
		}
	}

	submit() {
		if (this.tilesSelected.size !== 4) {
			return;
		}

		// get the tiles
		const [a, b, c, d] = [...this.tilesSelected].map(
			(tile) => this.tilesBySymbol.get(tile)!,
		);

		// is this guess correct?
		const correctGroupEntry = [...this.groupsIncomplete.entries()].find(
			([title]) => {
				const groupSymbols = this.groupsSets[title];
				return (
					groupSymbols.has(a.symbol) &&
					groupSymbols.has(b.symbol) &&
					groupSymbols.has(c.symbol) &&
					groupSymbols.has(d.symbol)
				);
			},
		);

		if (correctGroupEntry) {
			const [title, correctGroup] = correctGroupEntry;
			this.groupsComplete.set(title, correctGroup);
			this.groupsIncomplete.delete(title);

			this.tilesAvailable.delete(a.symbol);
			this.tilesAvailable.delete(b.symbol);
			this.tilesAvailable.delete(c.symbol);
			this.tilesAvailable.delete(d.symbol);

			this.verdict(Heckle.None, true, true);

			if (this.tilesAvailable.size === 0) {
				// render guess history as emoji
				this.symbolPuzzle$.subscribe((puzzle) => {
					const shareMessage = `u win

           Connections #${puzzle.id}

           ${this.guessHistory
				.slice(0, 8)
				.map((guess) => {
					return [...guess]
						.map(
							(symbolMember) =>
								this.symbolMemberToLevel.get(symbolMember)
									?.level,
						)
						.filter((level): level is number => level !== undefined)
						.map((levelIdx) => this.getEmoji(levelIdx))
						.join('');
				})
				.map((line) => line.trim())
				.join('\n')}`;

					prompt('Paste Your Progress', shareMessage);
					console.log(shareMessage);
				});

				// TODO: Launch modal and copy to clipboard
			}
			return;
		}

		// has the user already guessed this?
		const alreadyGuessed = this.guessHistory.some((previousGuess) => {
			return (
				previousGuess.has(a.symbol) &&
				previousGuess.has(b.symbol) &&
				previousGuess.has(c.symbol) &&
				previousGuess.has(d.symbol)
			);
		});

		if (alreadyGuessed) {
			this.verdict(Heckle.AlreadyGuessed, true);
			return;
		}

		// find a group that has 3 out of four tiles selected
		const oneAway = [...this.groupsIncomplete.entries()].some(
			([title, group]) => {
				const groupSymbols = [...group.members].map(
					(member) => member.symbol,
				);
				const incorrectGuesses = [...this.tilesSelected].filter(
					(tile) => !groupSymbols.includes(tile),
				);
				return incorrectGuesses.length === 1;
			},
		);

		if (oneAway) {
			this.verdict(Heckle.OneAway, true, true);
			return;
		}

		// this guess is wrong
		this.verdict(Heckle.None, true, true);
	}

	toggleTileSelection(symbol: symbol) {
		if (this.tilesSelected.has(symbol)) {
			this.tilesSelected.delete(symbol);
		} else if (this.tilesSelected.size < 4) {
			this.tilesSelected.add(symbol);
		}
	}
}

export const shuffleImmutable = <T>(_array: T[]): T[] => {
	const array = [..._array];
	let currentIndex = array.length;
	let randomIndex: number;
	while (currentIndex > 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}

	return array;
};
const isSetIdentical = (a: Set<string>, b: Set<string>) => {
	if (a.size !== b.size) {
		return false;
	}
	return [...a].every((x) => b.has(x));
};
