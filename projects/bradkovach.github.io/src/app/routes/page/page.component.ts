import type { SafeHtml } from '@angular/platform-browser';

import type { Observable } from 'rxjs';

import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { catchError, map, of, startWith, switchMap } from 'rxjs';

import fm from 'front-matter';

import { MarkdownService } from '../posts/post/post.component';

export interface ErrorModel<E> {
	error: E;
	status: 'error';
}

export interface LoadingModel {
	status: 'loading';
}

export interface ValueModel<V> {
	status: 'loaded';
	value: V;
}

export type ViewModel<V, E> = ErrorModel<E> | LoadingModel | ValueModel<V>;
export type ViewModelStatus = 'error' | 'loaded' | 'loading';
interface Page {
	body: SafeHtml;
	categories?: string[];
	created: Date;
	tags?: string[];
	title: string;
	updated?: Date;
}

interface PageJson {
	body: string;
	categories?: string[];
	created: string;
	tags?: string[];
	title: string;
	updated?: string;
}

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
				error,
				status: 'error' as const,
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
	imports: [AsyncPipe, DatePipe],
	selector: 'app-page',
	styleUrl: './page.component.scss',
	templateUrl: './page.component.html',
})
export class PageComponent {
	private route = inject(ActivatedRoute);
	slug$ = this.route.paramMap.pipe(
		map((p) => {
			if (p.has('slug')) {
				return p.get('slug')!;
			}
			throw new Error(
				'Page Not Found!' + this.route.snapshot.url.toString(),
			);
		}),
	);
	private md = inject(MarkdownService);

	private pageService = inject(PageService);
	private title = inject(Title);

	page$ = this.slug$.pipe(
		switchMap((slug) => {
			return this.pageService.getPageBySlug(slug);
		}),
		map((page): Page => {
			const pageJson = fm<PageJson>(page);

			this.title.setTitle(pageJson.attributes.title);

			return {
				body: this.md.render(pageJson.body),
				created: new Date(pageJson.attributes.created),
				title: pageJson.attributes.title,
				updated: pageJson.attributes.updated
					? new Date(pageJson.attributes.updated)
					: undefined,
			};
		}),
	);

	vm$ = viewModelFrom(this.page$);
}
