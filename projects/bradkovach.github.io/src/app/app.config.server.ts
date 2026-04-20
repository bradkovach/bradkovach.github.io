import type { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/ssr';

import { mergeApplicationConfig } from '@angular/core';

import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
	providers: [provideServerRendering()],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
