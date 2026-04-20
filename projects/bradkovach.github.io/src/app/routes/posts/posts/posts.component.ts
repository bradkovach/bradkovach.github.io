import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Injectable } from '@angular/core';
import hljs from 'highlight.js';
import markdownit, { type PluginWithOptions } from 'markdown-it';
import replaceLink, { type ReplaceLinkOptions } from 'markdown-it-replace-link';
import { map } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class PostsService {
	private http = inject(HttpClient);

	getPost(year: string, month: string, day: string, slug: string) {
		return this.http.get(
			`/assets/posts/${year}/${month}/${day}/${slug}.md`,
			{
				responseType: 'text',
			},
		);
	}

	getPostIndex() {
		return this.http.get('/assets/posts/index.md', {
			responseType: 'text',
		});
	}
}

@Component({
	imports: [AsyncPipe],
	selector: 'app-posts',
	styleUrl: './posts.component.scss',
	templateUrl: './posts.component.html',
})
export class PostsComponent {
	private md = markdownit({
		highlight: function (str, lang) {
			if (lang && hljs.getLanguage(lang)) {
				try {
					return hljs.highlight(str, { language: lang }).value;
				} catch {
					// ignore
					// return str;
				}
			}

			return ''; // use external default escaping
		},
	}).use<ReplaceLinkOptions>(
		replaceLink as PluginWithOptions<ReplaceLinkOptions>,
		{
			replaceLink: (link: string) => {
				return (
					'/blog/' + link.replace(/\.md$/, '').replace(/^\.\/?/, '')
				);
			},
		},
	);
	private postsService = inject(PostsService);

	posts$ = this.postsService.getPostIndex().pipe(
		map((index) => {
			return this.md.render(index, {});
		}),
	);
}
