import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ArticleTypePrivate } from '../models/article.models';

@Injectable({ providedIn: 'root' })
export class RouterService {
  #router = inject(Router);
  $$currentPath = signal<string>(this.#router.url);

  constructor() {
    this.#router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.$$currentPath.set(this.#router.url);
    });
  }

  getCurrentPath(): string {
    return this.$$currentPath();
  }

  navigateHome(): void {
    const urlTree = this.#router.parseUrl(this.#router.url);
    const isPrivateHome = urlTree.queryParams['articleType'] === ArticleTypePrivate;
    const isPrivateArticle = this.#router.url.startsWith('/view-private-article');

    const isAiHome = urlTree.queryParams['articleType'] === 'AI';
    const isAiArticle = this.#router.url.startsWith('/ai-view-article');

    if (isPrivateHome || isPrivateArticle) {
      this.#router.navigate(['/home'], { queryParams: { articleType: ArticleTypePrivate } });
    } else if (isAiHome || isAiArticle) {
      this.#router.navigate(['/home'], { queryParams: { articleType: 'AI' } });
    } else {
      this.#router.navigate(['/home']);
    }
  }
}
