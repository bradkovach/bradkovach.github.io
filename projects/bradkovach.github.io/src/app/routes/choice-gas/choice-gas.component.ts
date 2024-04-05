import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-choice-gas-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './choice-gas.component.html',
  styleUrl: './choice-gas.component.scss',
})
export class ChoiceGasComponent {
  private readonly appComponent = inject(AppComponent);
  constructor() {
    this.appComponent.setContainerMode('fluid');
  }
}
