import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/choice-gas.app';
import { appConfig } from './app/choice-gas.app.config';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
