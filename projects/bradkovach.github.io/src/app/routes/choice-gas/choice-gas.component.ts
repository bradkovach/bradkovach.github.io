import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-choice-gas-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './choice-gas.component.html',
  styleUrl: './choice-gas.component.scss',
})
export class ChoiceGasComponent {}
