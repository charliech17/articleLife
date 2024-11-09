import { Component, computed, effect, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiArticleService } from '../../shared/services/api/api-article/api-article.service';
import { IArticleDetailsResponse } from '../../shared/models/article.models';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ArticleOutlineService, IArticleOutline } from '../../shared/services/article-outline.service';
import { ApiArticleResponseService } from '../../shared/services/api/api-article-response/api-article-response.service';
import hljs from 'highlight.js';
import { ArticleResponseComponent } from './components/article-response/article-response.component';

@Component({
  selector: 'app-view-article',
  standalone: true,
  imports: [DatePipe, ArticleResponseComponent],
  templateUrl: './view-article.component.html',
  styleUrl: './view-article.component.scss',
})
export class ViewArticleComponent implements OnDestroy {
  #sanitizer = inject(DomSanitizer);
  #route = inject(ActivatedRoute);
  #apiArticleService = inject(ApiArticleService);
  #apiArticleResponseService = inject(ApiArticleResponseService);
  #articleOutlineService = inject(ArticleOutlineService);
  #platformId = inject(PLATFORM_ID);

  @ViewChild('contentContainer') contentContainer!: ElementRef;
  private _observer: IntersectionObserver | null = null;

  $$articleDetails = signal<IArticleListDetails>({
    id: -1,
    title: '',
    intro: '',
    articleContent: '',
    authorId: '',
    lastModifyTime: '',
    createdTime: '',
  });
  $$articleResponses = signal<IArticleResponses[]>([]);

  $articleContent = computed(() => this.getInnerHtml(this.$$articleDetails().articleContent));
  $articleCreateTime = computed(() => {
    const createdTime = this.$$articleDetails().createdTime;
    return createdTime ? new Date(createdTime) : new Date();
  });

  constructor() {
    this.getArticleContents();
    this.setupOutline();
  }

  ngOnDestroy(): void {
    this.#articleOutlineService.setOutlineContent([]);
    this.#articleOutlineService.setActiveHeaderId(null);
    if (this._observer) {
      this._observer.disconnect();
    }
  }

  getArticleContents() {
    this.#route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.apiGetArticle(id);
        this.apiGetArticleResponses(id);
      }
    });
  }

  apiGetArticle(id: string): void {
    this.#apiArticleService.getArticle(id).subscribe((response: IArticleDetailsResponse) => {
      this.$$articleDetails.set(response);
    });
  }

  apiGetArticleResponses(id: string): void {
    this.#apiArticleResponseService.getArticleResponses(id).subscribe({
      next: (response: IArticleResponses[]) => {
        this.$$articleResponses.set(response);
      },
    });
  }

  getInnerHtml(innerHTML: string): SafeHtml {
    return this.#sanitizer.bypassSecurityTrustHtml(innerHTML); // 使用 DomSanitizer
  }

  setupOutline() {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    effect(
      () => {
        if (this.$$articleDetails().articleContent) {
          setTimeout(() => {
            this.observeHeaderPositions();
            this.highlightCodeBlock();
          }, 0);
        }
      },
      { allowSignalWrites: true },
    );
  }

  setHeaderIdAndExtract(): IArticleOutline[] {
    const h2Elements = this.contentContainer.nativeElement.querySelectorAll('h2');
    const headerTitles: IArticleOutline[] = [];

    h2Elements.forEach((element: HTMLElement, index: number) => {
      if (!this._checkIsWantedHeader(element)) return;

      const id = `section-${index}`;
      element.setAttribute('id', id); // 設定唯一ID以便滾動
      headerTitles.push({ id, title: element.innerText, isActive: false, offsetTop: element.offsetTop });
    });

    return headerTitles;
  }

  observeHeaderPositions() {
    if (this._observer) {
      this._observer.disconnect();
    }

    this._observer = new IntersectionObserver(() => {
      const newOutlineContent = this.setHeaderIdAndExtract();
      this.#articleOutlineService.setOutlineContent(newOutlineContent);
    });

    this.contentContainer.nativeElement.querySelectorAll('h2').forEach((element: HTMLElement) => {
      if (!this._checkIsWantedHeader(element)) return;
      this._observer!.observe(element);
    });
  }

  private _checkIsWantedHeader(element: HTMLElement) {
    return element.tagName === 'H2' && !element.closest('pre');
  }

  highlightCodeBlock(): void {
    hljs.highlightAll();
  }

  addResponse(newResponse: IArticleResponses): void {
    this.$$articleResponses.update(prev => [...prev, newResponse]);
  }
}

export interface IArticleListDetails {
  id: number;
  title: string;
  intro: string;
  articleContent: string;
  authorId: string;
  lastModifyTime: string;
  createdTime: string;
}

export interface IArticleResponses {
  responseText: string;
  articleId: number;
  userId: number;
  userName: string;
  profileImage: string;
  createdTime: string;
  lastModifyTime: string;
  ext1: number;
}
