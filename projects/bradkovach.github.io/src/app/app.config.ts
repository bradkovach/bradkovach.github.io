import type { ApplicationConfig } from '@angular/core';

import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
	provideRouter,
	withComponentInputBinding,
	withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import {
	STORAGE,
	WINDOW,
} from './routes/choice-gas/pages/explorer/localStorageSignal';

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
