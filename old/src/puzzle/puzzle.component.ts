import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { FourStrings, Group, Puzzle } from '../main';

enum Heckle {
  OneAway = -1,
  None = 0,
  AlreadyGuessed = 1,
}

@Component({
  selector: 'app-puzzle',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.scss'],
})
export class PuzzleComponent implements OnDestroy {
  readonly Heckle = Heckle;
  private _puzzle = new ReplaySubject<Puzzle>(1);

  @Input() set puzzle(puzzle: Puzzle | null) {
    if (puzzle) {
      this._puzzle.next(puzzle);
    }
  }

  puzzle$ = this._puzzle.asObservable();

  groups!: [FourStrings, FourStrings, FourStrings, FourStrings];

  selected: Set<string> = new Set<string>();
  mistakesRemaining: number = 4;

  $puzzle = this.puzzle$.subscribe((puzzle) => {
    this.groups = puzzle.startingGroups;
  });

  private _remainingGroups: Map<string, Group> = new Map<string, Group>();
  private _completedGroups: Map<string, Group> = new Map<string, Group>();

  get remainingGroups(): [string, Group][] {
    return [...this._remainingGroups.entries()].map((group) => {
      return group;
    });
  }

  get completedGroups(): [string, Group][] {
    return [...this._completedGroups.entries()].map((group) => {
      return group;
    });
  }

  guesses: Set<string>[] = [];

  shuffle() {
    const allTiles = this.remainingGroups.reduce(
      (acc, [name, group]) => [...acc, ...group.members],
      [] as string[]
    );

    let currentIndex = allTiles.length;
    let randomIndex: number;
    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [allTiles[currentIndex], allTiles[randomIndex]] = [
        allTiles[randomIndex],
        allTiles[currentIndex],
      ];
    }

    while (allTiles.length > 0) {
      this.groups.push(allTiles.slice(0, 4) as FourStrings);
    }
  }

  deselectAll() {
    this.selected.clear();
  }

  private heckle = new BehaviorSubject<Heckle>(Heckle.None);

  heckle$ = this.heckle.asObservable();

  submit() {
    // has it been guessed already?
    const alreadyGuessed = this.guesses.some((guess) =>
      [...this.selected].every((tile) => guess.has(tile))
    );

    // is the guess one away?
    const isOneAway = [...this._remainingGroups].some(([name, group]) => {});
  }

  getColor(idx: number) {
    if (idx > 3 || idx < 0) {
      throw Error(`There is no color for row ${idx}.`);
    }
    return [
      '#f9df6d', //yellow
      '#a0c35a', // green
      '#b0c4ef', // blue
      '#ba81c5', // purple
    ][idx];
  }

  ngOnDestroy() {
    if (this.$puzzle) {
      this.$puzzle.unsubscribe();
    }
  }
}
