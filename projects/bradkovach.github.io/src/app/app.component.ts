import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
	imports: [RouterOutlet, RouterLink],
	selector: 'app-root',
	standalone: true,
	styleUrl: './app.component.scss',
	templateUrl: './app.component.html',
})
export class AppComponent {
	
  private _containerMode: 'fixed' | 'fluid' = 'fixed';

  get containerMode(): 'fixed' | 'fluid' {
    return this._containerMode;
  }

  set containerMode(value: 'fixed' | 'fluid') {
    this._containerMode = value;
  }

  setContainerMode(mode: 'fixed' | 'fluid') {
    this.containerMode = mode;
  }  

}
