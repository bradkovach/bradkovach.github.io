import type { ApplicationConfig} from '@angular/core';

import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';

import { appConfig } from './app.config';
import { Setting } from './routes/choice-gas/data/enum/settings.enum';
import { HeatmapScheme } from './routes/choice-gas/data/enum/heatmap.enum';
import {
	STORAGE,
	WINDOW,
} from './routes/choice-gas/pages/explorer/localStorageSignal';

class MemoryStorage implements Storage {
	[name: string]: any;
	get length(): number {
		return this.store.size;
	}
	private store = new Map<string, any>([
		[Setting.Scheme, HeatmapScheme.None],
	]);
	clear(): void {
		this.store.clear();
	}
	getItem(key: string): null | string {
		return this.store.get(key) || null;
	}
	key(index: number): null | string {
		return Array.from(this.store.keys())[index] || null;
	}
	removeItem(key: string): void {
		this.store.delete(key);
	}
	setItem(key: string, value: string): void {
		this.store.set(key, value);
	}
}

const serverConfig: ApplicationConfig = {
	providers: [
		provideServerRendering(),
		{ provide: STORAGE, useClass: MemoryStorage },
		{ provide: WINDOW, useValue: null },
	],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
