import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
    imports: [RouterOutlet, FormsModule, DatePipe],
    selector: 'app-connections',
    styleUrl: './connections.component.scss',
    templateUrl: './connections.component.html'
})
export class ConnectionsComponent {
  connectionsEpoch = new Date('2021-01-01T00:00:00.000Z');
  date = new Date();
  puzzleData = '';
  constructor() {
    this.date.setHours(0, 0, 0, 0);
  }

  getRedirectUri() {
    const url = new URL(window.location.href);
    url.pathname = '/connections/solve';

    // YYYY-MM-DD only
    const isoDate = this.date.toISOString().split('T')[0];

    const pipedreamUrl = new URL(
      'https://eo60fyejfn7wtgq.m.pipedream.net/connections',
    );
    pipedreamUrl.searchParams.append('date', isoDate);
    pipedreamUrl.searchParams.set('redirectUri', url.toString());

    return pipedreamUrl.toString();
  }

  loadPuzzle() {
    //
  }

  // onDateChange(date: Event) {
  //   console.log(date.target.value);
  // }
}
