import { Routes } from '@angular/router';
import { ArchiveComponent } from './archive/archive.component';
import { PostComponent } from './post/post.component';
import { PostsComponent } from './posts/posts.component';

export const POSTS_ROUTES: Routes = [
  {
    path: '',
    component: PostsComponent,
    pathMatch: 'full',
  },
  {
    path: ':year/:month/:day',
    component: ArchiveComponent,
  },
  {
    path: ':year/:month/:day/:slug',
    component: PostComponent,
  },
];
