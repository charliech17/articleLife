import { Component, computed, effect, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiAiArticleService } from '../../shared/services/api/api-ai-article/api-ai-article.service';
import { ArticleTypePublic, IArticleDetails } from '../../shared/models/article.models';
import { SEOService } from '../../shared/services/seo.service';
import { ScrollService } from '../../shared/services/scroll.service';
import hljs from 'highlight.js';
import { CategoriesPipe } from '../../shared/filters/categories.pipe';

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
    
    effect(() => {
      if (this.$$articleDetails().articleContent && isPlatformBrowser(this.#platformId)) {
        setTimeout(() => {
          hljs.highlightAll();
        }, 0);
      }
    });

    if (isPlatformBrowser(this.#platformId)) {
      this.#scrollService.scrollToTop();
    }
  }

  ngOnDestroy(): void {
  }

  getArticleContents() {
    this.#route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        let decodedId = id;
        try {
          decodedId = window.atob(id);
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

  parseMarkdown(md: string): string {
    let html = md || '';
    
    // Remove the first level-1 heading if it is at the very beginning of the markdown
    html = html.replace(/^\s*#\s+.*?\n/m, '');

    // headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' style='max-width:100%; border-radius: 8px;' />");
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>");
    html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");
    html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
    const lines = html.split('\n');
    let inList = false;
    let resHtml = '';
    for (let line of lines) {
      if (line.trim().startsWith('- ')) {
        if (!inList) { resHtml += '<ul>\n'; inList = true; }
        resHtml += `<li>${line.trim().substring(2)}</li>\n`;
      } else {
        if (inList) { resHtml += '</ul>\n'; inList = false; }
        if (line.trim() !== '') {
          if (!/^<(\/)?(h|ul|ol|li|blockquote|pre|img)/.test(line.trim())) {
            resHtml += `<p>${line.trim()}</p>\n`;
          } else {
            resHtml += `${line.trim()}\n`;
          }
        }
      }
    }
    if (inList) { resHtml += '</ul>\n'; }
    return resHtml;
  }
}
