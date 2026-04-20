import type { ApplicationConfig } from '@angular/core';

import { provideHttpClient, withFetch } from '@angular/common/http';
import {
	provideRouter,
	withComponentInputBinding,
	withInMemoryScrolling,
} from '@angular/router';

import { routes } from './choice-gas.routes';
import { provideTemplatedTitle } from './pages/main/main.component';

const now = new Date();

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withFetch()),
		provideRouter(
			routes,
			withComponentInputBinding(),
			withInMemoryScrolling({
				anchorScrolling: 'enabled',
				scrollPositionRestoration: 'enabled',
			}),
		),
		provideTemplatedTitle(
			[
				'{0}',
				`${now.getFullYear()} Choice Gas Guide`,
				'United Way of Albany County',
			].join(' - '),
		),
	],
};
