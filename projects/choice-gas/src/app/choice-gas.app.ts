import { DatePipe } from '@angular/common';
import { Component, computed, DOCUMENT, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';

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

	readonly updated = lastUpdated;

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
}
