import type { ApplicationConfig } from '@angular/core';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import {
	provideRouter,
	withComponentInputBinding,
	withInMemoryScrolling,
} from '@angular/router';

import {
	STORAGE,
	WINDOW,
} from '../../../choice-gas/src/app/moved/pages/explorer/localStorageSignal';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(
			routes,
			withComponentInputBinding(),
			withInMemoryScrolling({
				anchorScrolling: 'enabled',
				scrollPositionRestoration: 'enabled',
			}),
		),
		provideHttpClient(withFetch()),
		provideClientHydration(),
		{
			provide: STORAGE,
			useFactory: () => localStorage,
		},
		{
			provide: WINDOW,
			useFactory: () => window,
		},
	],
};
