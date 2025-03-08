import { Meta, Title } from '@angular/platform-browser';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SEOService {
  #titleService = inject(Title);
  #meta = inject(Meta);

  updateMetaTags(metaData: MetaTag) {
    this.#titleService.setTitle(metaData.title);

    // Standard Meta Tags
    this.#meta.addTag({ name: 'description', content: metaData.description });
    this.#meta.addTag({ name: 'keywords', content: metaData.keywords });

    // Open Graph Meta Tags
    this.#meta.addTag({ property: 'og:title', content: metaData.ogTitle });
    this.#meta.addTag({ property: 'og:description', content: metaData.ogDescription });
    this.#meta.addTag({ property: 'og:image', content: metaData.ogImage });
  }
}

interface MetaTag {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}
