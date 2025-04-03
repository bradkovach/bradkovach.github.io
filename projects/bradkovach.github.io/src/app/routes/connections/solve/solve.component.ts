import type { Observable} from 'rxjs';

import type { StringPuzzle } from '../../../../types/StringPuzzle';

import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { catchError, filter, map, of, shareReplay } from 'rxjs';

import { PuzzleComponent } from '../../../puzzle/puzzle.component';

type SolveViewModel =
  | {
      error: string;
      status: 'error';
    }
  | {
      puzzle: StringPuzzle;
      status: 'loaded';
    };

@Component({
    imports: [AsyncPipe, PuzzleComponent, RouterLink],
    selector: 'app-solve',
    styleUrl: './solve.component.scss',
    templateUrl: './solve.component.html'
})
export class SolveComponent {
  private readonly route = inject(ActivatedRoute);

  puzzle$ = this.route.queryParamMap.pipe(
    map((params) => {
      if (!params.has('puzzle')) {
        throw new Error('No puzzle found in query params');
      }
      return params.get('puzzle')!;
    }),
    map((puzzle) => atob(puzzle)),
    map((puzzle) => JSON.parse(puzzle) as StringPuzzle),
    shareReplay(1),
  );

  vm$: Observable<SolveViewModel> = this.puzzle$.pipe(
    map((puzzle) => ({ puzzle, status: 'loaded' as const })),
    catchError((err: Error) => {
      return of({ error: err.message, status: 'error' as const });
    }),
  );
}
