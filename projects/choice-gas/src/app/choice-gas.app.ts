import { DatePipe } from '@angular/common';
import { Component, computed, DOCUMENT, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';
import { interval, map } from 'rxjs';
import { lastUpdated } from './data/last-updated';
import { DataService, EnrollmentField } from './services/data/data.service';

@Component({
	imports: [RouterOutlet],
	selector: 'app-root',
	styles: [],
	template: `<router-outlet></router-outlet>`,
})
export class App {}

@Component({
	imports: [RouterOutlet, RouterLink, FormsModule, DatePipe],
	selector: 'app-choice-gas-root',
	styleUrl: './choice-gas.app.scss',
	templateUrl: './choice-gas.app.html',
})
export class ChoiceGasApp {
	public readonly EnrollmentField = EnrollmentField;

	private readonly dataService = inject(DataService);

	enrollmentFields = this.dataService.enrollmentFields;

	notesLines = computed(() => {
		return (
			this.enrollmentFields()[EnrollmentField.Notes].trim().split('\n')
				.length + 1
		);
	});

	showNotes = signal(false);
	navExpanded = signal(false);

	readonly updated = lastUpdated;

	readonly announcements = [
		{
			endDate: new Date('2026-04-11T09:00:00-06:00'),
			classes: ['text-primary', 'text-center'],
			text: 'United Way of Albany County offers FREE tax preparation for households with income at or under $75,000 per year.*',
			link: {
				href: 'https://unitedwayalbanycounty.org/book',
				text: 'Learn more and schedule an appointment',
			},
		},
	];
	// readonly vitaDeadline = new Date('2026-04-09T09:41:00-06:00');

	readonly now = toSignal(interval(1000).pipe(map(() => new Date())), {
		initialValue: new Date(),
	});

	#document = inject(DOCUMENT);

	clearAllSettings() {
		const win = this.#document.defaultView;
		if (win) {
			win.localStorage.clear();
			// refresh the page
			win.location.reload();
		}
	}

	setEnrollmentField(field: EnrollmentField, value: string) {
		this.dataService.setEnrollmentField(field, value);
	}

	setShowNotes(value: boolean) {
		this.showNotes.set(value);
	}

	toggleNotes() {
		this.showNotes.update((current) => !current);
	}

	toggleNav() {
		this.navExpanded.update((current) => !current);
	}
}
