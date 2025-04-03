import type { Routes } from '@angular/router';

import { CreateComponent } from './routes/connections/create/create.component';
import { SolveComponent } from './routes/connections/solve/solve.component';
import { PageComponent } from './routes/page/page.component';

export const routes: Routes = [
	{
		loadChildren: () =>
			import('./routes/posts/posts.routes').then((m) => m.POSTS_ROUTES),
		path: 'blog',
	},
	{
		loadChildren: () =>
			import('./routes/games/games.routes').then((m) => m.GAMES_ROUTES),
		path: 'games',
	},
	{
		loadChildren: () =>
			import('./routes/notary/notary.routes').then(
				(m) => m.NOTARY_ROUTES,
			),
		path: 'notary',
	},
	{
		loadChildren: () =>
			import('./routes/choice-gas/choice-gas.routes').then(
				(m) => m.CHOICE_GAS_ROUTES,
			),
		path: 'choice-gas',
	},
	{
		children: [
			// {
			//   path: '',
			//   pathMatch: 'full',
			//   component: ConnectionsComponent,
			// },
			{
				component: CreateComponent,
				path: 'create',
			},
			{
				component: SolveComponent,
				path: 'solve',
			},
			{
				path: '**',
				redirectTo: 'solve',
			},
		],
		path: 'connections',
	},
	{
		component: PageComponent,
		path: ':slug',
	},
	{
		component: PageComponent,
		path: '**',
	},
];
