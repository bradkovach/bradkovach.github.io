import type { Routes } from '@angular/router';

import { PostComponent } from './post/post.component';
import { PostsComponent } from './posts/posts.component';
import { ArchiveComponent } from './archive/archive.component';

export const POSTS_ROUTES: Routes = [
  {
    component: PostsComponent,
    path: '',
    pathMatch: 'full',
  },
  {
    component: ArchiveComponent,
    path: ':year/:month/:day',
  },
  {
    component: PostComponent,
    path: ':year/:month/:day/:slug',
  },
];
