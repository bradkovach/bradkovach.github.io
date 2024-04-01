import { Observable, catchError, map, of, startWith } from 'rxjs';

export type ViewModelStatus = 'loading' | 'loaded' | 'error';

export type LoadingModel = { status: 'loading' };
export type ValueModel<V> = { status: 'loaded'; value: V };
export type ErrorModel<E> = { status: 'error'; error: E };

export type ViewModel<V, E> = LoadingModel | ValueModel<V> | ErrorModel<E>;

export function viewModelFrom<V, E>(
  source: Observable<V>,
): Observable<ViewModel<V, E>> {
  return source.pipe(
    map((value) => ({
      status: 'loaded' as const,
      value,
    })),
    startWith({ status: 'loading' as const }),
    catchError((error: E) =>
      of({
        error,
        status: 'error' as const,
      }),
    ),
  );
}
