import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-outlet',
	standalone: true,
	imports: [RouterOutlet, RouterLink],
	templateUrl: './outlet.component.html',
	styleUrl: './outlet.component.scss',
})
export class OutletComponent {}
