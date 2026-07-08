import { GlobalStore } from './../../shared/stores/global.store';
import { AfterViewInit, Component, computed, effect, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiArticleService } from '../../shared/services/api/api-article/api-article.service';
import { ArticleTypePublic, IArticleDetails, IArticleFile, IArticleResponses } from '../../shared/models/article.models';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ArticleOutlineService, IArticleOutline } from '../../shared/services/article-outline.service';
import { ApiArticleResponseService } from '../../shared/services/api/api-article-response/api-article-response.service';
import hljs from 'highlight.js';
import { ArticleResponseComponent } from './components/article-response/article-response.component';
import { CategoriesPipe } from '../../shared/filters/categories.pipe';
import { ScrollService } from '../../shared/services/scroll.service';
import { SEOService } from '../../shared/services/seo.service';
import { RouterService } from '../../shared/services/router.service';
import { ApiArticleFilesService } from '../../shared/services/api/api-article-files/api-article-files.service';
import { forkJoin } from 'rxjs';
import { AppUtil } from '../../shared/utils/app.util';

@Component({
  selector: 'app-view-article',
  standalone: true,
  imports: [DatePipe, ArticleResponseComponent, CategoriesPipe],
  templateUrl: './view-article.component.html',
  styleUrl: './view-article.component.scss',
})
export class ViewArticleComponent implements AfterViewInit, OnDestroy {
  #sanitizer = inject(DomSanitizer);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #apiArticleService = inject(ApiArticleService);
  #apiArticleFilesService = inject(ApiArticleFilesService);
  #apiArticleResponseService = inject(ApiArticleResponseService);
  #articleOutlineService = inject(ArticleOutlineService);
  #scrollService = inject(ScrollService);
  #globalStore = inject(GlobalStore);
  #routerService = inject(RouterService);
  #platformId = inject(PLATFORM_ID);
  #seoService = inject(SEOService);

  @ViewChild('contentContainer') contentContainer!: ElementRef;

  $$articleDetails = signal<IArticleDetails>({
    id: -1,
    title: '',
    intro: '',
    articleContent: '',
    authorId: '',
    lastModifyTime: '',
    createdTime: '',
    categories: '',
    viewTimes: 0,
    articleType: ArticleTypePublic,
    extField1: null,
  });
  $$articleResponses = signal<IArticleResponses[]>([]);
  isCopied = signal<boolean>(false);
  $$fileFirstImageUrl = signal<string | null>(null);

  copyUrl(): void {
    if (isPlatformBrowser(this.#platformId)) {
      const url = new URL(window.location.href);
      url.searchParams.delete('title');
      navigator.clipboard.writeText(url.href).then(() => {
        this.isCopied.set(true);
        setTimeout(() => this.isCopied.set(false), 2000);
      });
    }
  }

  $articleContent = computed(() => this.getInnerHtml(this.$$articleDetails().articleContent));
  $articleCreateTime = computed(() => {
    const createdTime = this.$$articleDetails().createdTime;
    return createdTime ? new Date(createdTime) : new Date();
  });

  $userInfo = computed(() => this.#globalStore.userInfo());
  $isSameUser = computed(() => this.$userInfo().loginId === this.$$articleDetails().authorId);

  constructor() {
    this.getArticleContents();
    this.setupOutline();
  }

  ngAfterViewInit(): void {
    this.windowScrollToTop();
  }

  ngOnDestroy(): void {
    this.#articleOutlineService.destroyOutline();
    this.#globalStore.setCurrentArticleInfo(null);
  }

  getArticleContents() {
    this.#route.paramMap.subscribe(params => {
      const id = params.get('id');
      const isPrivate = this.#router.url.includes('view-private-article');
      if (id) {
        const decodedId = AppUtil.decodeBase64Id(id);
        this.apiGetArticleContents(decodedId, isPrivate || false);
      }
    });
  }

  apiGetArticleContents(id: string, isPrivate: boolean): void {
    // 使用forkJoin '同時' 打兩支 API
    forkJoin({
      articleContent: isPrivate ? this.#apiArticleService.getMyPrivateArticle(id) : this.#apiArticleService.getArticle(id),
      articleAndFile: this.#apiArticleFilesService.getFileAndArticleByArticleId(id),
      articleResponses: this.#apiArticleResponseService.getArticleResponses(id),
    }).subscribe({
      next: ({ articleContent, articleAndFile, articleResponses }) => {
        this.updateArticleContents(articleContent, articleAndFile, articleResponses);
        this.#globalStore.setCurrentArticleInfo({ id: articleContent.id, authorId: articleContent.authorId });
      },
      error: error => {
        console.error(error);
        this.#routerService.navigateHome();
      },
    });
  }

  updateArticleContents(articleContent: IArticleDetails, articleAndFile: IArticleFile | null, articleResponses: IArticleResponses[]) {
    this.$$articleDetails.set(articleContent);
    this.$$fileFirstImageUrl.set(articleAndFile?.fileUrl || null);
    this.updateSeoMetaTags();
    this.$$articleResponses.set(articleResponses);
  }

  updateSeoMetaTags() {
    const { title, intro, categories } = this.$$articleDetails();
    this.#seoService.updateMetaTags({
      title,
      description: intro,
      keywords: categories || '',
      ogTitle: title,
      ogDescription: intro,
      ogImage: this.$$fileFirstImageUrl() || '',
    });
  }

  getInnerHtml(innerHTML: string): SafeHtml {
    return this.#sanitizer.bypassSecurityTrustHtml(innerHTML); // 使用 DomSanitizer
  }

  setupOutline() {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    effect(() => {
      if (this.$$articleDetails().articleContent) {
        setTimeout(() => {
          this.#articleOutlineService.setupOutline(this.contentContainer.nativeElement);
          this.highlightCodeBlock();
        }, 0);
      }
    });
  }

  highlightCodeBlock(): void {
    hljs.highlightAll();
  }

  addResponse(newResponse: IArticleResponses): void {
    this.$$articleResponses.update(prev => [...prev, newResponse]);
  }

  private windowScrollToTop() {
    this.#scrollService.scrollToTop();
  }
}
