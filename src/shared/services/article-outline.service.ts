import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ArticleOutlineService {
  $$outlineContent = signal<IArticleOutline[]>([]);
  $outlineContent = this.$$outlineContent.asReadonly();

  $$activeHeaderId = signal<string | null>(null);
  $activeHeaderId = this.$$activeHeaderId.asReadonly();

  private _observer: IntersectionObserver | null = null;

  constructor() { }

  setOutlineContent(outlineContent: IArticleOutline[]): void {
    this.$$outlineContent.set(outlineContent);
  }

  setActiveHeaderId(activeHeaderId: string | null): void {
    this.$$activeHeaderId.set(activeHeaderId);
  }

  setupOutline(container: HTMLElement): void {
    this.observeHeaderPositions(container);
  }

  destroyOutline(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    this.setOutlineContent([]);
    this.setActiveHeaderId(null);
  }

  private observeHeaderPositions(container: HTMLElement): void {
    if (this._observer) {
      this._observer.disconnect();
    }

    this._observer = new IntersectionObserver(() => {
      const newOutlineContent = this.setHeaderIdAndExtract(container);
      this.setOutlineContent(newOutlineContent);
    });

    const mainContainer = container.closest('.cus-view-article-container');
    if (mainContainer) {
      const h1Element = mainContainer.querySelector('h1.cus-article-title') as HTMLElement;
      if (h1Element) {
        this._observer.observe(h1Element);
      }
    }

    container.querySelectorAll('h2').forEach((element: HTMLElement) => {
      if (!this._checkIsWantedHeader(element)) return;
      this._observer!.observe(element);
    });
  }

  private setHeaderIdAndExtract(container: HTMLElement): IArticleOutline[] {
    const h2Elements = container.querySelectorAll('h2');
    const headerTitles: IArticleOutline[] = [];

    const mainContainer = container.closest('.cus-view-article-container');
    if (mainContainer) {
      const h1Element = mainContainer.querySelector('h1.cus-article-title') as HTMLElement;
      if (h1Element) {
        h1Element.setAttribute('id', 'section-title');
        headerTitles.push({ 
          id: 'section-title', 
          title: h1Element.innerText, 
          isActive: false, 
          offsetTop: h1Element.offsetTop, 
          level: 1 
        });
      }
    }

    h2Elements.forEach((element: HTMLElement, index: number) => {
      if (!this._checkIsWantedHeader(element)) return;

      const id = `section-${index}`;
      element.setAttribute('id', id); // 設定唯一ID以便滾動
      headerTitles.push({ id, title: element.innerText, isActive: false, offsetTop: element.offsetTop, level: 2 });
    });

    return headerTitles;
  }

  private _checkIsWantedHeader(element: HTMLElement): boolean {
    return element.tagName === 'H2' && !element.closest('pre');
  }
}

export interface IArticleOutline {
  id: string;
  title: string;
  isActive: boolean;
  offsetTop: number;
  level?: number;
}
