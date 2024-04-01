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
	example = `eyJpZCI6MTg1LCJncm91cHMiOnsiR09MRiBDT1VSU0UgUEFSVFMiOnsibGV2ZWwiOjAsIm1lbWJlcnMiOlsiQlVOS0VSIiwiRkFJUldBWSIsIkdSRUVOIiwiUk9VR0giXX0sIlx1MjAxY0kgR0lWRSFcdTIwMWQiOnsibGV2ZWwiOjEsIm1lbWJlcnMiOlsiRU5PVUdIIiwiTUVSQ1kiLCJTVE9QIiwiVU5DTEUiXX0sIklOREVDRU5UIjp7ImxldmVsIjoyLCJtZW1iZXJzIjpbIkJBV0RZIiwiQkxVRSIsIkNPQVJTRSIsIlJJU1FVRSJdfSwiXHUyMDFkLU9VR0hcdTIwMWQgV09SRFMgVEhBVCBET05cdTIwMTlUIFJIWU1FIjp7ImxldmVsIjozLCJtZW1iZXJzIjpbIkJPVUdIIiwiQ09VR0giLCJET1VHSCIsIlRPVUdIIl19fSwic3RhcnRpbmdHcm91cHMiOltbIlRPVUdIIiwiU1RPUCIsIlJPVUdIIiwiQkxVRSJdLFsiR1JFRU4iLCJET1VHSCIsIkNPQVJTRSIsIkVOT1VHSCJdLFsiQ09VR0giLCJVTkNMRSIsIkJPVUdIIiwiQkFXRFkiXSxbIkJVTktFUiIsIlJJU1FVRSIsIk1FUkNZIiwiRkFJUldBWSJdXX0=`;

	title = 'connections';

	containerMode: 'fluid' | 'fixed' = 'fixed';

	setContainerMode(type: 'fluid' | 'fixed') {
		this.containerMode = type;
	}
}
