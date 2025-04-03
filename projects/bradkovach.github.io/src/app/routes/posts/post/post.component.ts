import type { SafeHtml } from '@angular/platform-browser';

import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { map, switchMap } from 'rxjs';

import fm from 'front-matter';
import hljs from 'highlight.js';
import markdownit from 'markdown-it';

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
	imports: [AsyncPipe, DatePipe],
	selector: 'app-post',
	styleUrl: './post.component.scss',
	templateUrl: './post.component.html',
})
export class PostComponent {
	private md = inject(MarkdownService);
	private posts = inject(PostsService);

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
				categories?: string[];
				date: Date;
				tags?: string[];
				title: string;
			}>(post);

			return {
				body: this.md.render(parsed.body),
				categories: parsed.attributes.categories,
				date: parsed.attributes.date,
				tags: parsed.attributes.tags,
				title: parsed.attributes.title,
			};
		}),
	);
}
