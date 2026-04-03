import {
	Component,
	DOCUMENT,
	inject,
	Injectable,
	InjectionToken,
	type Provider,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { lastUpdated } from '../../data/last-updated';

export const PAGE_TITLE_TEMPLATE = new InjectionToken<string>(
	'PAGE_TITLE_TEMPLATE',
	{
		factory: () => '{0}',
		providedIn: 'root',
	},
);

export const OriginalTitle = new InjectionToken<Title>('OriginalTitle');

export const provideTemplatedTitle = (template: string): Provider[] => [
	{
		provide: PAGE_TITLE_TEMPLATE,
		useValue: template,
	},
	{
		provide: OriginalTitle,
		useFactory: () => new Title(inject(DOCUMENT)),
	},
	{
		provide: Title,
		useClass: TemplatedTitle,
	},
];

@Injectable()
export class TemplatedTitle {
	#template = inject(PAGE_TITLE_TEMPLATE);
	#title = inject(OriginalTitle);

	getTitle(): string {
		return this.#title.getTitle();
	}

	setTitle(title: string): void {
		this.#title.setTitle(this.#template.replace('{0}', title));
	}
}

@Component({
	imports: [RouterLink],
	selector: 'app-choice-gas-main',
	styleUrl: './main.component.scss',
	templateUrl: './main.component.html',
})
export class MainComponent {
	get lastUpdated() {
		return lastUpdated;
	}
	private readonly title: Title = inject(Title);
	constructor() {
		this.title.setTitle(`${this.lastUpdated.getFullYear()} Guide`);
	}
}
