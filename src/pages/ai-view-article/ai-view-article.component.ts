import { Component, computed, effect, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiAiArticleService } from '../../shared/services/api/api-ai-article/api-ai-article.service';
import { ArticleTypePublic, IArticleDetails } from '../../shared/models/article.models';
import { SEOService } from '../../shared/services/seo.service';
import { ScrollService } from '../../shared/services/scroll.service';
import hljs from 'highlight.js';
import { marked } from 'marked';
import { CategoriesPipe } from '../../shared/filters/categories.pipe';
import { ArticleOutlineService, IArticleOutline } from '../../shared/services/article-outline.service';

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
      navigator.clipboard.writeText(window.location.href).then(() => {
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
        let decodedId = id;
        try {
          decodedId = atob(id);
        } catch (e) {
          // fallback in case it's not base64 encoded
        }
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
          articleContent: this.parseMarkdown(articleContent.articleContent),
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

  parseMarkdown(md: string): string {
    let markdownString = md || '';
    
    // Remove the first level-1 heading if it is at the very beginning of the markdown
    markdownString = markdownString.replace(/^\s*#\s+.*?\n/m, '');

    // Parse markdown to HTML
    let html = marked.parse(markdownString) as string;
    
    // Add custom styles to images to match previous behavior
    html = html.replace(/<img([^>]*)>/gi, "<img$1 style='max-width:100%; border-radius: 8px;' />");

    return html;
  }
}
