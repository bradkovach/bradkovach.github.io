import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
	imports: [JsonPipe],
	selector: 'app-developers',
	styleUrl: './developers.component.scss',
	templateUrl: './developers.component.html',
})
export class DevelopersComponent {
	private readonly title: Title = inject(Title);
	constructor() {
		this.title.setTitle('Choice Gas - Developers');
	}
}
