import { SafeHtml } from '@angular/platform-browser';

export interface Page {
  title: string;
  created: Date;
  updated?: Date;
  body: SafeHtml;
  categories?: string[];
  tags?: string[];
}
