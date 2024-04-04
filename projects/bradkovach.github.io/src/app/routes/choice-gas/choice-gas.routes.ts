import { Routes } from '@angular/router';
import { DataEditorComponent } from './pages/data-editor/data-editor.component';
import { DevelopersComponent } from './pages/developers/developers.component';
import { ExplorerComponent } from './pages/explorer/explorer.component';
import { ImportComponent } from './pages/import/import.component';
import { MainComponent } from './pages/main/main.component';
import { OfferComponent } from './pages/offer/offer.component';
import { OffersComponent } from './pages/offers/offers.component';
import { OutletComponent } from './pages/outlet/outlet.component';
import { VendorComponent } from './pages/vendor/vendor.component';
import { VendorsComponent } from './pages/vendors/vendors.component';

export const CHOICE_GAS_ROUTES: Routes = [
  {
    path: '',
    component: OutletComponent,
    children: [
      {
        path: '',
        component: MainComponent,
      },
      {
        path: 'import',
        component: ImportComponent,
      },
      {
        path: 'data-editor',
        component: DataEditorComponent,
      },
      {
        path: 'developers',
        component: DevelopersComponent,
      },
      {
        path: 'explorer',
        component: ExplorerComponent,
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
        path: 'vendors/:vendorId/offers',
        component: OffersComponent,
      },
      {
        path: 'vendors/:vendorId/offers/:offerId',
        component: OfferComponent,
      },
    ],
  },
];
