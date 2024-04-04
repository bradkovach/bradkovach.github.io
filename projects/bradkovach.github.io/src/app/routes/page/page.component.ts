import { AsyncPipe, DatePipe, JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Injectable, inject } from '@angular/core';
import { SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import fm from 'front-matter';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { MarkdownService } from '../posts/post/post.component';

interface Page {
  title: string;
  created: Date;
  updated?: Date;
  body: SafeHtml;
  categories?: string[];
  tags?: string[];
}

interface PageJson {
  title: string;
  created: string;
  updated?: string;
  body: string;
  categories?: string[];
  tags?: string[];
}

export type ViewModelStatus = 'loading' | 'loaded' | 'error';

export type LoadingModel = { status: 'loading' };
export type ValueModel<V> = { status: 'loaded'; value: V };
export type ErrorModel<E> = { status: 'error'; error: E };

export type ViewModel<V, E> = LoadingModel | ValueModel<V> | ErrorModel<E>;

function viewModelFrom<V, E>(
  source: Observable<V>,
): Observable<ViewModel<V, E>> {
  return source.pipe(
    map((value) => ({
      status: 'loaded' as const,
      value,
    })),
    startWith({ status: 'loading' as const }),
    catchError((error: E) =>
      of({
        status: 'error' as const,
        error,
      }),
    ),
  );
}

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
  private title = inject(Title);

  private route = inject(ActivatedRoute);
  slug$ = this.route.paramMap.pipe(
    map((p) => {
      if (p.has('slug')) {
        return p.get('slug')!;
      }
      throw new Error('Page Not Found!' + this.route.snapshot.url.toString());
    }),
  );

  page$ = this.slug$.pipe(
    switchMap((slug) => {
      return this.pageService.getPageBySlug(slug);
    }),
    map((page): Page => {
      const pageJson = fm<PageJson>(page);

      this.title.setTitle(pageJson.attributes.title);

      return {
        title: pageJson.attributes.title,
        created: new Date(pageJson.attributes.created),
        updated: pageJson.attributes.updated
          ? new Date(pageJson.attributes.updated)
          : undefined,
        body: this.md.render(pageJson.body),
      };
    }),
  );

  vm$ = viewModelFrom(this.page$);
}
