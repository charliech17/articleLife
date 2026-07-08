import { Component, computed, effect, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiAiArticleService } from '../../shared/services/api/api-ai-article/api-ai-article.service';
import { ArticleTypePublic, IArticleDetails } from '../../shared/models/article.models';
import { SEOService } from '../../shared/services/seo.service';
import { ScrollService } from '../../shared/services/scroll.service';
import hljs from 'highlight.js';
import { CategoriesPipe } from '../../shared/filters/categories.pipe';
import { parseMarkdownArticle, parseMarkdownIntro } from '../../shared/utils/markdown.util';
import { ArticleOutlineService } from '../../shared/services/article-outline.service';
import { AppUtil } from '../../shared/utils/app.util';
import { GlobalService } from '../../shared/services/global.service';

@Component({
  selector: 'app-ai-view-article',
  standalone: true,
  imports: [DatePipe, CategoriesPipe],
  templateUrl: './ai-view-article.component.html',
  styleUrl: './ai-view-article.component.scss'
})
export class AiViewArticleComponent implements OnDestroy {
  #sanitizer = inject(DomSanitizer);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #apiAiArticleService = inject(ApiAiArticleService);
  #seoService = inject(SEOService);
  #scrollService = inject(ScrollService);
  #platformId = inject(PLATFORM_ID);
  #articleOutlineService = inject(ArticleOutlineService);
  #globalService = inject(GlobalService);

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

  isCopied = signal<boolean>(false);

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

  askAi(): void {
    if (isPlatformBrowser(this.#platformId)) {
      const url = new URL(window.location.href);
      url.searchParams.delete('title');
      const message = `請總結這篇文章：${url.href}`;
      this.#globalService.aiChatTrigger.next(message);
    }
  }

  $articleContent = computed(() => this.getInnerHtml(this.$$articleDetails().articleContent));
  $articleCreateTime = computed(() => {
    const createdTime = this.$$articleDetails().createdTime;
    return createdTime ? new Date(createdTime) : new Date();
  });

  $articleIntroHtml = computed(() => {
    const intro = this.$$articleDetails().intro;
    if (!intro) return null;

    const parsedHtml = parseMarkdownIntro(intro);
    return this.getInnerHtml(parsedHtml);
  });

  constructor() {
    this.getArticleContents();
    this.setupOutline();

    if (isPlatformBrowser(this.#platformId)) {
      this.#scrollService.scrollToTop();
    }
  }

  ngOnDestroy(): void {
    this.#articleOutlineService.destroyOutline();
  }

  getArticleContents() {
    this.#route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const decodedId = AppUtil.decodeBase64Id(id);
        this.apiGetArticleContents(decodedId);
      }
    });
  }

  apiGetArticleContents(id: string): void {
    this.#apiAiArticleService.getAiArticleById(id).subscribe({
      next: (articleContent: any) => {
        this.$$articleDetails.set({
          id: articleContent.id,
          title: articleContent.title,
          intro: articleContent.intro,
          articleContent: parseMarkdownArticle(articleContent.articleContent),
          authorId: '',
          lastModifyTime: articleContent.createdTime,
          createdTime: articleContent.createdTime,
          categories: JSON.stringify([articleContent.category?.categoryName || 'AI 文章']),
          viewTimes: articleContent.viewTimes,
          articleType: ArticleTypePublic,
          extField1: null
        });

        this.updateSeoMetaTags();
      },
      error: error => {
        console.error(error);
        this.#router.navigate(['/home']);
      }
    });
  }

  updateSeoMetaTags() {
    const { title, intro } = this.$$articleDetails();
    this.#seoService.updateMetaTags({
      title,
      description: intro || 'AI 文章',
      keywords: 'AI, 文章',
      ogTitle: title,
      ogDescription: intro || 'AI 文章',
      ogImage: '',
    });
  }

  getInnerHtml(innerHTML: string): SafeHtml {
    return this.#sanitizer.bypassSecurityTrustHtml(innerHTML);
  }

  setupOutline() {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    effect(() => {
      if (this.$$articleDetails().articleContent) {
        setTimeout(() => {
          this.#articleOutlineService.setupOutline(this.contentContainer.nativeElement);
          hljs.highlightAll();
        }, 0);
      }
    });
  }
}
