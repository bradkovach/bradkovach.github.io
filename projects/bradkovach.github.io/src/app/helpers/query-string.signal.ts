import { DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * A writable signal that reads and writes a query string parameter.
 *
 * @param name The name of the query string parameter to get.
 * @returns A signal that reads and writes the value of the query string parameter.
 */
export const queryStringSignal = (name: string) => {
	const route = inject(ActivatedRoute);
	const router = inject(Router);
	const x = inject(DestroyRef);
	const s = signal<null | string | string[]>(null);

	route.queryParamMap.pipe(takeUntilDestroyed(x)).subscribe((params) => {
		const value = params.get(name);
		if (value !== s()) {
			s.set(value);
		}
	});

	const e = effect(() => {
		const value = s();
		console.log(`signal ${name} changed`, value);

		void router.navigate([], {
			queryParams: {
				[name]: value ? value : null,
			},
			queryParamsHandling: 'merge',
		});
	});

	x.onDestroy(() => {
		e.destroy();
	});

	return s;
};
