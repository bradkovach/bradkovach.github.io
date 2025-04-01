import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    imports: [RouterOutlet, RouterLink],
    selector: 'app-root',
    styleUrl: './app.component.scss',
    templateUrl: './app.component.html'
})
export class AppComponent {
  private _containerMode = signal<'fixed' | 'fluid'>('fixed');

  containerMode = this._containerMode.asReadonly();

  setContainerMode(mode: 'fixed' | 'fluid') {
    this._containerMode.set(mode);
  }
}
