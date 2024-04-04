import { Routes } from '@angular/router';
import { NotaryComponent } from './notary.component';

export const NOTARY_ROUTES: Routes = [
  {
    path: '',
    component: NotaryComponent,
    children: [],
  },
];
