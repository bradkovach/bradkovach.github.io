import { effect, inject, InjectionToken, signal } from '@angular/core';
export const WINDOW = new InjectionToken<null | Window>('window');

export type Parser<T> = (s: string) => T;
export type Serializer<T> = (i: T) => string;

export const STORAGE = new InjectionToken<Storage>('storage');

export const storageSignal = <T, K extends string = string>(
	key: K,
	defaultValue: T,
	serialize: Serializer<T> = JSON.stringify,
	parse: Parser<T> = JSON.parse,
) => {
	const storage = inject(STORAGE);
	const Window = inject(WINDOW);
	const s = signal<T>(defaultValue);

	effect(() => {
		storage.setItem(key, serialize(s()));
	});

	try {
		const value = storage.getItem(key);
		if (value !== null) {
			s.set(parse(value));
		}
	} catch {
		s.set(defaultValue);
	}

	// Window is injected and will NOT be available in SSR
	// in SSR contexts, it will be null; in browser contexts, it will be the window object.
	if (Window) {
		Window.addEventListener('storage', (e: StorageEvent) => {
			if (
				e.storageArea !== storage ||
				e.key !== key ||
				!e.newValue ||
				e.newValue === e.oldValue
			) {
				return;
			}

			s.set(parse(e.newValue));
		});
	}

	return s;
};
