import { AsyncPipe, DatePipe, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import fm from 'front-matter';
import { map, switchMap } from 'rxjs';
import { MarkdownService } from '../posts/post/post.component';
import { Page } from './Page';
import { PageJson } from './PageJson';
import { PageService } from './PageService';
import { viewModelFrom } from './viewModelFrom';

@Component({
	imports: [AsyncPipe, JsonPipe, DatePipe],
	selector: 'app-page',
	standalone: true,
	styleUrl: './page.component.scss',
	templateUrl: './page.component.html',
})
export class PageComponent {
	private md = inject(MarkdownService);
	private pageService = inject(PageService);

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

	page$ = this.slug$.pipe(
		switchMap((slug) => this.pageService.getPageBySlug(slug)),
		map((page): Page => {
			const pageJson = fm<PageJson>(page);

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
