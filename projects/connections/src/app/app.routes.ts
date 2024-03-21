import { Routes } from '@angular/router';
import { CreateComponent } from './routes/connections/create/create.component';
import { SolveComponent } from './routes/connections/solve/solve.component';
import { PageComponent } from './routes/page/page.component';

export const routes: Routes = [
  {
    path: 'blog',
    loadChildren: () =>
      import('./routes/posts/posts.routes').then((m) => m.POSTS_ROUTES),
  },
  {
    path: 'games',
    loadChildren: () =>
      import('./routes/games/games.routes').then((m) => m.GAMES_ROUTES),
  },
  {
    path: 'notary',
    loadChildren: () =>
      import('./routes/notary/notary.module').then((m) => m.NotaryModule),
  },
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
    path: ':slug',
    component: PageComponent,
  },
  {
    path: '**',
    component: PageComponent,
  },
];
