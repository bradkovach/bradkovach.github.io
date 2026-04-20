import type { BootstrapContext } from '@angular/platform-browser';

import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = (bootstrapContext: BootstrapContext) =>
	bootstrapApplication(AppComponent, config, bootstrapContext);

export default bootstrap;
