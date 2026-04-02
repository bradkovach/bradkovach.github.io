import type { ApplicationConfig } from '@angular/core';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './choice-gas.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withFetch()),
		provideRouter(routes, withComponentInputBinding()),
	],
};
