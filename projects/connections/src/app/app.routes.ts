import { Routes } from '@angular/router';
import { SolveComponent } from './routes/connections/solve/solve.component';
import { CreateComponent } from './routes/connections/create/create.component';
import { ConnectionsComponent } from './routes/connections/connections.component';

export const routes: Routes = [
  {
    path: 'connections',
    children: [
      // {
      //   path: '',
      //   pathMatch: 'full',
      //   component: ConnectionsComponent,
      // },
      {
        path: 'create',
        component: CreateComponent,
      },
      {
        path: 'solve',
        component: SolveComponent,
      },
      {
        path: '**',
        redirectTo: 'solve',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'connections',
  },
];
