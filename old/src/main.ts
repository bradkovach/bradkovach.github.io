import { AsyncPipe, JsonPipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter, RouterLink } from '@angular/router';
import { map, timer, startWith, tap } from 'rxjs';
import 'zone.js';
import { PuzzleComponent } from './puzzle/puzzle.component';

export type FourStrings = [string, string, string, string];

export interface Group {
  level: number;
  members: FourStrings;
}

export interface Puzzle {
  id: number;
  groups: Record<string, Group>;
  startingGroups: [FourStrings, FourStrings, FourStrings, FourStrings];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, JsonPipe, RouterLink, PuzzleComponent],
  template: `
    <h1>Angular NYT Connections Client</h1>
    <p>Play any NYT Connections puzzle.</p>
    <p>
      <a [routerLink]="['/']" [queryParams]="{puzzle: puzzleBase64$ | async}">Permalink</a>
    </p>
    <app-puzzle [puzzle]="puzzle$ | async"></app-puzzle>
  `,
})
export class App {
  private readonly route = inject(ActivatedRoute);

  nowIsoDate$ = timer(0, 1000).pipe(
    map((i) => new Date().toISOString().slice(0, 10))
  );

  constructor() {
    const puzzle: Puzzle = {
      id: 185,
      groups: {
        'GOLF COURSE PARTS': {
          level: 0,
          members: ['BUNKER', 'FAIRWAY', 'GREEN', 'ROUGH'],
        },
        '“I GIVE!”': {
          level: 1,
          members: ['ENOUGH', 'MERCY', 'STOP', 'UNCLE'],
        },
        INDECENT: {
          level: 2,
          members: ['BAWDY', 'BLUE', 'COARSE', 'RISQUE'],
        },
        '”-OUGH” WORDS THAT DON’T RHYME': {
          level: 3,
          members: ['BOUGH', 'COUGH', 'DOUGH', 'TOUGH'],
        },
      },
      startingGroups: [
        ['TOUGH', 'STOP', 'ROUGH', 'BLUE'],
        ['GREEN', 'DOUGH', 'COARSE', 'ENOUGH'],
        ['COUGH', 'UNCLE', 'BOUGH', 'BAWDY'],
        ['BUNKER', 'RISQUE', 'MERCY', 'FAIRWAY'],
      ],
    };
    console.log(
      'b64',
      btoa(
        JSON.stringify(puzzle)!.replace(
          /[^\x20-\x7F]/g,
          (x) => '\\u' + ('000' + x.codePointAt(0)!.toString(16)).slice(-4)
        )
      )
    );
  }

  example = `eyJpZCI6MTg1LCJncm91cHMiOnsiR09MRiBDT1VSU0UgUEFSVFMiOnsibGV2ZWwiOjAsIm1lbWJlcnMiOlsiQlVOS0VSIiwiRkFJUldBWSIsIkdSRUVOIiwiUk9VR0giXX0sIlx1MjAxY0kgR0lWRSFcdTIwMWQiOnsibGV2ZWwiOjEsIm1lbWJlcnMiOlsiRU5PVUdIIiwiTUVSQ1kiLCJTVE9QIiwiVU5DTEUiXX0sIklOREVDRU5UIjp7ImxldmVsIjoyLCJtZW1iZXJzIjpbIkJBV0RZIiwiQkxVRSIsIkNPQVJTRSIsIlJJU1FVRSJdfSwiXHUyMDFkLU9VR0hcdTIwMWQgV09SRFMgVEhBVCBET05cdTIwMTlUIFJIWU1FIjp7ImxldmVsIjozLCJtZW1iZXJzIjpbIkJPVUdIIiwiQ09VR0giLCJET1VHSCIsIlRPVUdIIl19fSwic3RhcnRpbmdHcm91cHMiOltbIlRPVUdIIiwiU1RPUCIsIlJPVUdIIiwiQkxVRSJdLFsiR1JFRU4iLCJET1VHSCIsIkNPQVJTRSIsIkVOT1VHSCJdLFsiQ09VR0giLCJVTkNMRSIsIkJPVUdIIiwiQkFXRFkiXSxbIkJVTktFUiIsIlJJU1FVRSIsIk1FUkNZIiwiRkFJUldBWSJdXX0=`;

  puzzleBase64$ = this.route.queryParamMap.pipe(
    map((params) => params.get('puzzle')),
    startWith(this.example),
    map((maybeBase64) => {
      if (!maybeBase64) {
        throw Error('No puzzle provided in query string.');
      }
      return maybeBase64;
    })
  );

  puzzle$ = this.puzzleBase64$.pipe(
    map((b64) => atob(b64)),
    tap(console.log),
    map((rename) => JSON.parse(rename) as Puzzle)
  );
}

bootstrapApplication(App, {
  providers: [provideHttpClient(), provideRouter([])],
});
