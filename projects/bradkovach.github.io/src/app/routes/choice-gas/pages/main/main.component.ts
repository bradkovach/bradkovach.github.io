import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-choice-gas-main',
    imports: [RouterLink],
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss'
})
export class MainComponent {
  constructor(title: Title) {
    title.setTitle('Choice Gas');
  }
}
