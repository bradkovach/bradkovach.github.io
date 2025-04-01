import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-connections',
    imports: [RouterOutlet, FormsModule, DatePipe],
    templateUrl: './connections.component.html',
    styleUrl: './connections.component.scss'
})
export class ConnectionsComponent {
  connectionsEpoch = new Date('2021-01-01T00:00:00.000Z');
  date = new Date();
  puzzleData: string = '';
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
