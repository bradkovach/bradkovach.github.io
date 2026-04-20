import type { Routes } from '@angular/router';

import { ChoiceGasComponent } from './choice-gas.component';
import { DataEditorComponent } from './pages/data-editor/data-editor.component';
import { DevelopersComponent } from './pages/developers/developers.component';
import { ExplorerComponent } from './pages/explorer/explorer.component';
import { ImportComponent } from './pages/import/import.component';
import { MainComponent } from './pages/main/main.component';
import { OfferComponent } from './pages/offer/offer.component';
import { OffersComponent } from './pages/offers/offers.component';
import { VendorComponent } from './pages/vendor/vendor.component';
import { VendorsComponent } from './pages/vendors/vendors.component';

export const CHOICE_GAS_ROUTES: Routes = [
	{
		children: [
			{
				component: MainComponent,
				path: '',
			},
			{
				component: ImportComponent,
				path: 'import',
			},
			{
				component: DataEditorComponent,
				path: 'data-editor',
			},
			{
				component: DevelopersComponent,
				path: 'developers',
			},
			{
				component: ExplorerComponent,
				path: 'explorer',
			},
			{
				component: VendorsComponent,
				path: 'vendors',
			},
			{
				component: VendorComponent,
				path: 'vendors/:vendorId',
			},
			{
				component: OffersComponent,
				path: 'vendors/:vendorId/offers',
			},
			{
				component: OfferComponent,
				path: 'vendors/:vendorId/offers/:offerId',
			},
		],
		component: ChoiceGasComponent,
		path: '',
	},
];
