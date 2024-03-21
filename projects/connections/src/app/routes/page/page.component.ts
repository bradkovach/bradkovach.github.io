import { AsyncPipe, DatePipe, JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import fm from 'front-matter';
import { map, switchMap } from 'rxjs';
import { MarkdownService } from '../posts/post/post.component';

@Injectable({
  providedIn: 'root',
})
export class PageService {
  private http = inject(HttpClient);

  getPageBySlug(slug: string) {
    return this.http.get(`/assets/pages/${slug}.md`, {
      responseType: 'text',
    });
  }
}

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [AsyncPipe, JsonPipe, DatePipe],
  templateUrl: './page.component.html',
  styleUrl: './page.component.scss',
})
export class PageComponent {
  private pageService = inject(PageService);
  private md = inject(MarkdownService);

  private route = inject(ActivatedRoute);
  slug$ = this.route.params.pipe(
    map((params) => {
      return params['slug'];
    }),
  );

  page$ = this.slug$.pipe(
    switchMap((slug) => {
      return this.pageService.getPageBySlug(slug);
    }),
    map((page) => {
      const parsed = fm<{
        title: string;
        created: string;
        updated?: string;
        categories?: string[];
        tags?: string[];
      }>(page);

      return {
        title: parsed.attributes.title,
        date: new Date(parsed.attributes.created),
        updated: parsed.attributes.updated
          ? new Date(parsed.attributes.updated)
          : undefined,
        body: this.md.render(parsed.body),
      };
    }),
  );
}
