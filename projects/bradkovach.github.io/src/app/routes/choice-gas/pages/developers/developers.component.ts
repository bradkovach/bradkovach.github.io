import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-developers',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './developers.component.html',
  styleUrl: './developers.component.scss',
})
export class DevelopersComponent {
  constructor(title: Title) {
    title.setTitle('Choice Gas - Developers');
  }
}
