import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'connections';

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

  example = `eyJpZCI6MTg1LCJncm91cHMiOnsiR09MRiBDT1VSU0UgUEFSVFMiOnsibGV2ZWwiOjAsIm1lbWJlcnMiOlsiQlVOS0VSIiwiRkFJUldBWSIsIkdSRUVOIiwiUk9VR0giXX0sIlx1MjAxY0kgR0lWRSFcdTIwMWQiOnsibGV2ZWwiOjEsIm1lbWJlcnMiOlsiRU5PVUdIIiwiTUVSQ1kiLCJTVE9QIiwiVU5DTEUiXX0sIklOREVDRU5UIjp7ImxldmVsIjoyLCJtZW1iZXJzIjpbIkJBV0RZIiwiQkxVRSIsIkNPQVJTRSIsIlJJU1FVRSJdfSwiXHUyMDFkLU9VR0hcdTIwMWQgV09SRFMgVEhBVCBET05cdTIwMTlUIFJIWU1FIjp7ImxldmVsIjozLCJtZW1iZXJzIjpbIkJPVUdIIiwiQ09VR0giLCJET1VHSCIsIlRPVUdIIl19fSwic3RhcnRpbmdHcm91cHMiOltbIlRPVUdIIiwiU1RPUCIsIlJPVUdIIiwiQkxVRSJdLFsiR1JFRU4iLCJET1VHSCIsIkNPQVJTRSIsIkVOT1VHSCJdLFsiQ09VR0giLCJVTkNMRSIsIkJPVUdIIiwiQkFXRFkiXSxbIkJVTktFUiIsIlJJU1FVRSIsIk1FUkNZIiwiRkFJUldBWSJdXX0=`;
}
