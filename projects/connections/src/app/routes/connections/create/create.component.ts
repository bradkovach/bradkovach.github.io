import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StringPuzzle } from '../../../../types/StringPuzzle';
import { StringMemberRow } from '../../../../types/StringMemberRow';
import { SymbolLevel } from '../../../../types/SymbolLevel';
import { StringLevel } from '../../../../types/StringLevel';
import { shuffleImmutable } from '../../../puzzle/puzzle.component';
import { JsonPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PuzzleHelpers } from '../../../helpers/puzzle-helpers';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [FormsModule, JsonPipe, RouterLink],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  private readonly router = inject(Router);

  toJson() {
    prompt('Your Puzzle as JSON', JSON.stringify(this.generatePuzzle()));
  }
  toPlayer() {
    // go to ./solve?puzzle=...
    this.router.navigate(['/connections/solve'], {
      queryParams: { puzzle: this.getBase64(this.generatePuzzle()) },
    });
  }
  toPermalink() {
    prompt("Your Puzzle's Permalink", this.getPermalink());
  }
  levels = [0, 1, 2, 3];

  emoji = ['🟨', '🟩', '🟦', '🟪'];

  colors = [
    '#fdcb58', //yellow
    '#78b159', // green
    '#55acee', // blue
    '#aa8ed6', // purple
  ];

  categories: StringMemberRow = ['Yellow', 'Green', 'Blue', 'Purple'];

  words: StringMemberRow[] = [
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
  ];

  examples: Record<string, StringPuzzle> = {
    // Normal Puzzle has no duplicates
    normal: {
      id: -1234,
      groups: {
        'Morning Drinks': {
          level: 0,
          members: ['Tea', 'Coffee', 'Juice', 'Cocoa'],
        },
        'Chocolate Products': {
          level: 1,
          members: ['Truffle', 'Mousse', 'Fudge', 'Brownie'],
        },
        'Baked Goods': {
          level: 2,
          members: ['Muffin', 'Bagel', 'Croissant', 'Cookie'],
        },
        'Internet Terms': {
          level: 3,
          members: ['Browser', 'Server', 'Firewall', 'Domain'],
        },
      },
      startingGroups: [
        ['Firewall', 'Brownie', 'Bagel', 'Croissant'],
        ['Fudge', 'Cocoa', 'Tea', 'Browser'],
        ['Server', 'Juice', 'Mousse', 'Muffin'],
        ['Domain', 'Cookie', 'Truffle', 'Coffee'],
      ],
    },

    // Duplicate Puzzle has duplicate words
    chaotic: {
      id: 1234,
      groups: {
        ONE: {
          level: 0,
          members: ['ONE', 'ONE', 'ONE', 'ONE'],
        },
        TWO: {
          level: 1,
          members: ['TWO', 'TWO', 'TWO', 'TWO'],
        },
        THREE: {
          level: 2,
          members: ['THREE', 'THREE', 'THREE', 'THREE'],
        },
        FOUR: {
          level: 3,
          members: ['ONE', 'TWO', 'THREE', 'FOUR'],
        },
      },
      startingGroups: [
        ['TWO', 'ONE', 'THREE', 'THREE'],
        ['ONE', 'ONE', 'FOUR', 'TWO'],
        ['THREE', 'TWO', 'TWO', 'ONE'],
        ['TWO', 'THREE', 'THREE', 'ONE'],
      ],
    },
  };

  loadExample(ex: keyof typeof this.examples) {
    const puzzle = this.examples[ex];

    this.loadPuzzle(puzzle);
  }

  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.route.snapshot.queryParams['puzzle'] &&
      this.loadPuzzle(
        PuzzleHelpers.fromBase64(this.route.snapshot.queryParams['puzzle']),
      );
  }

  loadPuzzle(puzzle: StringPuzzle) {
    console.log(puzzle);
    this.categories = Object.keys(puzzle.groups) as StringMemberRow;
    this.words = Object.values(puzzle.groups).map(
      (group) => group.members,
    ) as StringMemberRow[];
  }

  generatePuzzle() {
    const groups = this.levels.reduce(
      (acc, level, i) => {
        const category = this.categories[i].toUpperCase();
        const members = this.words[i];
        acc[category] = {
          level,
          members: members.map((word) => word.toUpperCase()) as StringMemberRow,
        };
        return acc;
      },
      {} as Record<string, StringLevel>,
    );

    const allStrings = this.words.flat().map((word) => word.toUpperCase());

    const shuffled = shuffleImmutable(allStrings);

    const puzzle: StringPuzzle = {
      id: 1234,
      groups,
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
}
