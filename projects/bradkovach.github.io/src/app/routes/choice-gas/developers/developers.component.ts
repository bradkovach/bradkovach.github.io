import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
	selector: 'app-developers',
	standalone: true,
	imports: [JsonPipe],
	templateUrl: './developers.component.html',
	styleUrl: './developers.component.scss',
})
export class DevelopersComponent {}
