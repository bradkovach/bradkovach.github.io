import { Routes } from '@angular/router';
import { ChoiceGasCalculatorComponent } from './choice-gas-calculator/choice-gas-calculator.component';
import { ChoiceGasIndexComponent } from './choice-gas-index/choice-gas-index.component';
import { DataComponent } from './data/data.component';
import { DevelopersComponent } from './developers/developers.component';
import { OfferComponent } from './offer/offer.component';
import { OffersComponent } from './offers/offers.component';
import { OutletComponent } from './outlet/outlet.component';
import { VendorComponent } from './vendor/vendor.component';
import { VendorsComponent } from './vendors/vendors.component';

export const CHOICE_GAS_ROUTES: Routes = [
	{
		path: '',
		component: OutletComponent,
		children: [
			{
				path: '',
				component: ChoiceGasIndexComponent,
			},
			{
				path: 'data',
				component: DataComponent,
			},
			{
				path: 'developers',
				component: DevelopersComponent,
			},
			{
				path: 'calculator',
				component: ChoiceGasCalculatorComponent,
			},
			{
				path: 'vendors',
				component: VendorsComponent,
			},
			{
				path: 'vendors/:vendor',
				component: VendorComponent,
			},
			{
				path: 'vendors/:vendor/offers',
				component: OffersComponent,
			},
			{
				path: 'vendors/:vendor/offers/:offer',
				component: OfferComponent,
			},
		],
	},
];
