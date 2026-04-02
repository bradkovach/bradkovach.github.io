import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { lastUpdated } from '../../data/last-updated';

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
		this.title.setTitle('Choice Gas');
	}
}
