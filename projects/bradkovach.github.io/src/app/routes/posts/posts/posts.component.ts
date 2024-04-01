import { AsyncPipe, JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Injectable, inject } from '@angular/core';
import hljs from 'highlight.js';
import markdownit from 'markdown-it';
import { map } from 'rxjs';

import replaceLink from 'markdown-it-replace-link';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private http = inject(HttpClient);

  getPost(year: string, month: string, day: string, slug: string) {
    return this.http.get(`/assets/posts/${year}/${month}/${day}/${slug}.md`, {
      responseType: 'text',
    });
  }

  getPostIndex() {
    return this.http.get('/assets/posts/index.md', {
      responseType: 'text',
    });
  }
}

@Component({
  imports: [AsyncPipe, JsonPipe],
  selector: 'app-posts',
  standalone: true,
  styleUrl: './posts.component.scss',
  templateUrl: './posts.component.html',
})
export class PostsComponent {
  private md = markdownit({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }

      return ''; // use external default escaping
    },
  }).use<any>(replaceLink as any, {
    replaceLink: (link: string) => {
      return '/blog/' + link.replace(/\.md$/, '').replace(/^\.\/?/, '');
    },
  });
  private postsService = inject(PostsService);

  posts$ = this.postsService.getPostIndex().pipe(
    map((index) => {
      return this.md.render(index, {});
    }),
  );
}
