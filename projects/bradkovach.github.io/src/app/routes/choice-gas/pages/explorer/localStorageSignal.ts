import { InjectionToken, effect, inject, signal } from '@angular/core';

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

	return s;
};
