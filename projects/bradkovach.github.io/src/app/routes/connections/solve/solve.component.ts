import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, filter, map, of, shareReplay } from 'rxjs';
import { StringPuzzle } from '../../../../types/StringPuzzle';
import { AsyncPipe } from '@angular/common';
import { PuzzleComponent } from '../../../puzzle/puzzle.component';

type SolveViewModel =
  | {
      status: 'loaded';
      puzzle: StringPuzzle;
    }
  | {
      status: 'error';
      error: string;
    };

@Component({
    selector: 'app-solve',
    imports: [AsyncPipe, PuzzleComponent, RouterLink],
    templateUrl: './solve.component.html',
    styleUrl: './solve.component.scss'
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
    map((puzzle) => ({ status: 'loaded' as const, puzzle })),
    catchError((err: Error) => {
      return of({ status: 'error' as const, error: err.message });
    }),
  );
}
