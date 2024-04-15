import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { lastUpdated } from './data/last-updated';
import { WINDOW } from './pages/explorer/localStorageSignal';
import { DataService, EnrollmentField } from './services/data/data.service';

@Component({
	selector: 'app-choice-gas-root',
	standalone: true,
	imports: [RouterOutlet, RouterLink, FormsModule, DatePipe],
	templateUrl: './choice-gas.component.html',
	styleUrl: './choice-gas.component.scss',
})
export class ChoiceGasComponent {
	private readonly dataService = inject(DataService);

	readonly updated = lastUpdated;

	public readonly EnrollmentField = EnrollmentField;

	enrollmentFields = this.dataService.enrollmentFields;

	notesLines = computed(() => {
		return (
			this.enrollmentFields()[EnrollmentField.Notes].trim().split('\n')
				.length + 1
		);
	});

	setEnrollmentField(field: EnrollmentField, value: string) {
		this.dataService.setEnrollmentField(field, value);
	}

	showNotes = signal(false);

	toggleNotes() {
		this.showNotes.update((current) => !current);
	}

	setShowNotes(value: boolean) {
		this.showNotes.set(value);
	}

	Window = inject(WINDOW);

	clearAllSettings() {
		if (this.Window) {
			window.localStorage.clear();
			// refresh the page
			window.location.reload();
		}
	}
}
