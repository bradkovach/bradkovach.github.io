import type { BootstrapContext } from '@angular/platform-browser';

import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/choice-gas.app';
import { config } from './app/choice-gas.config.server';

const bootstrap = (context: BootstrapContext) =>
	bootstrapApplication(App, config, context);

export default bootstrap;
