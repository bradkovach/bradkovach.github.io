import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Component, computed, inject, signal } from '@angular/core';

import { DataService, EnrollmentField } from './services/data/data.service';

import { lastUpdated } from './data/last-updated';
import { WINDOW } from './pages/explorer/localStorageSignal';

@Component({
    imports: [RouterOutlet, RouterLink, FormsModule, DatePipe],
    selector: 'app-choice-gas-root',
    styleUrl: './choice-gas.component.scss',
    templateUrl: './choice-gas.component.html'
})
export class ChoiceGasComponent {
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

	Window = inject(WINDOW);

	clearAllSettings() {
		if (this.Window) {
			window.localStorage.clear();
			// refresh the page
			window.location.reload();
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
