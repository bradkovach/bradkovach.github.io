import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

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
