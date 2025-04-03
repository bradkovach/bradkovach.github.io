import type { StringLevel } from '../../../../types/StringLevel';
import type { StringMemberRow } from '../../../../types/StringMemberRow';
import type { StringPuzzle } from '../../../../types/StringPuzzle';

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PuzzleHelpers } from '../../../helpers/puzzle-helpers';
import { shuffleImmutable } from '../../../puzzle/puzzle.component';

@Component({
	imports: [FormsModule],
	selector: 'app-create',
	styleUrl: './create.component.scss',
	templateUrl: './create.component.html',
})
export class CreateComponent {
	categories: StringMemberRow = ['Yellow', 'Green', 'Blue', 'Purple'];

	colors = [
		'#fdcb58', //yellow
		'#78b159', // green
		'#55acee', // blue
		'#aa8ed6', // purple
	];
	emoji = ['🟨', '🟩', '🟦', '🟪'];
	examples: Record<string, StringPuzzle> = {
		// Duplicate Puzzle has duplicate words
		chaotic: {
			groups: {
				FOUR: {
					level: 3,
					members: ['ONE', 'TWO', 'THREE', 'FOUR'],
				},
				ONE: {
					level: 0,
					members: ['ONE', 'ONE', 'ONE', 'ONE'],
				},
				THREE: {
					level: 2,
					members: ['THREE', 'THREE', 'THREE', 'THREE'],
				},
				TWO: {
					level: 1,
					members: ['TWO', 'TWO', 'TWO', 'TWO'],
				},
			},
			id: 1234,
			startingGroups: [
				['TWO', 'ONE', 'THREE', 'THREE'],
				['ONE', 'ONE', 'FOUR', 'TWO'],
				['THREE', 'TWO', 'TWO', 'ONE'],
				['TWO', 'THREE', 'THREE', 'ONE'],
			],
		},

		// Normal Puzzle has no duplicates
		normal: {
			groups: {
				'Baked Goods': {
					level: 2,
					members: ['Muffin', 'Bagel', 'Croissant', 'Cookie'],
				},
				'Chocolate Products': {
					level: 1,
					members: ['Truffle', 'Mousse', 'Fudge', 'Brownie'],
				},
				'Internet Terms': {
					level: 3,
					members: ['Browser', 'Server', 'Firewall', 'Domain'],
				},
				'Morning Drinks': {
					level: 0,
					members: ['Tea', 'Coffee', 'Juice', 'Cocoa'],
				},
			},
			id: -1234,
			startingGroups: [
				['Firewall', 'Brownie', 'Bagel', 'Croissant'],
				['Fudge', 'Cocoa', 'Tea', 'Browser'],
				['Server', 'Juice', 'Mousse', 'Muffin'],
				['Domain', 'Cookie', 'Truffle', 'Coffee'],
			],
		},
	};
	levels = [0, 1, 2, 3];

	words: StringMemberRow[] = [
		['', '', '', ''],
		['', '', '', ''],
		['', '', '', ''],
		['', '', '', ''],
	];

	private readonly route = inject(ActivatedRoute);

	private readonly router = inject(Router);

	constructor() {
		this.route.snapshot.queryParams['puzzle'] &&
			this.loadPuzzle(
				PuzzleHelpers.fromBase64(
					this.route.snapshot.queryParams['puzzle'],
				),
			);
	}

	generatePuzzle() {
		const groups = this.levels.reduce(
			(acc, level, i) => {
				const category = this.categories[i].toUpperCase();
				const members = this.words[i];
				acc[category] = {
					level,
					members: members.map((word) =>
						word.toUpperCase(),
					) as StringMemberRow,
				};
				return acc;
			},
			{} as Record<string, StringLevel>,
		);

		const allStrings = this.words.flat().map((word) => word.toUpperCase());

		const shuffled = shuffleImmutable(allStrings);

		const puzzle: StringPuzzle = {
			groups,
			id: 1234,
			startingGroups: [
				shuffled.slice(0, 4) as StringMemberRow,
				shuffled.slice(4, 8) as StringMemberRow,
				shuffled.slice(8, 12) as StringMemberRow,
				shuffled.slice(12, 16) as StringMemberRow,
			],
		};
		return puzzle;
	}

	getBase64(puzzle: StringPuzzle) {
		return PuzzleHelpers.toBase64(puzzle);
	}

	getPermalink() {
		const puzzle = this.generatePuzzle();
		const encoded = PuzzleHelpers.toBase64(puzzle);
		const url = new URL(window.location.href);
		url.pathname = '/connections/solve';
		url.searchParams.set('puzzle', encoded);
		return url.toString();
	}

	loadExample(ex: keyof typeof this.examples) {
		const puzzle = this.examples[ex];

		this.loadPuzzle(puzzle);
	}

	loadPuzzle(puzzle: StringPuzzle) {
		console.log(puzzle);
		this.categories = Object.keys(puzzle.groups) as StringMemberRow;
		this.words = Object.values(puzzle.groups).map(
			(group) => group.members,
		) as StringMemberRow[];
	}

	toJson() {
		prompt('Your Puzzle as JSON', JSON.stringify(this.generatePuzzle()));
	}

	toPermalink() {
		prompt("Your Puzzle's Permalink", this.getPermalink());
	}

	toPlayer() {
		// go to ./solve?puzzle=...
		return this.router.navigate(['/connections/solve'], {
			queryParams: { puzzle: this.getBase64(this.generatePuzzle()) },
		});
	}
}
