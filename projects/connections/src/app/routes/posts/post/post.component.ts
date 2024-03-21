import { AsyncPipe, DatePipe, JsonPipe } from '@angular/common';
import { Component, Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import fm from 'front-matter';
import hljs from 'highlight.js';
import markdownit from 'markdown-it';
import { map, switchMap } from 'rxjs';
import { PostsService } from '../posts/posts.component';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  private md = markdownit({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }

      return ''; // use external default escaping
    },
  });

  private sanitize = inject(DomSanitizer);

  render(md: string): SafeHtml {
    return this.sanitize.bypassSecurityTrustHtml(this.md.render(md));
  }
}

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [AsyncPipe, JsonPipe, DatePipe],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
})
export class PostComponent {
  private posts = inject(PostsService);
  private md = inject(MarkdownService);

  private route = inject(ActivatedRoute);

  post$ = this.route.params.pipe(
    switchMap((params) => {
      return this.posts.getPost(
        params['year'],
        params['month'],
        params['day'],
        params['slug'],
      );
    }),
    map((post) => {
      const parsed = fm<{
        title: string;
        date: Date;
        tags?: string[];
        categories?: string[];
      }>(post);

      return {
        title: parsed.attributes.title,
        date: parsed.attributes.date,
        tags: parsed.attributes.tags,
        categories: parsed.attributes.categories,
        body: this.md.render(parsed.body),
      };
    }),
  );
}
