import { AfterViewInit, Component, computed, inject, input, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesPipe } from '../../../../shared/filters/categories.pipe';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { IArticleFile, IArticleInfo, ExtField1JSON } from '../../../../shared/models/article.models';
import { ESessionStorageItems, StorageService } from '../../../../shared/services/storage.service';
import { ScrollService } from '../../../../shared/services/scroll.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { parseMarkdownIntro } from '../../../../shared/utils/markdown.util';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CategoriesPipe, DatePipe, NgbCarousel, NgbSlide],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
})
export class ArticleListComponent implements AfterViewInit, OnInit {
  #router = inject(Router);
  #storageService = inject(StorageService);
  #scrollService = inject(ScrollService);
  #platformId = inject(PLATFORM_ID);
  #sanitizer = inject(DomSanitizer);

  $iptArticleList = input.required<IIptArticleList>({ alias: 'iptArticleList' });

  $parsedArticles = computed(() => {
    const listInfo = this.$iptArticleList();
    return listInfo.articleList.map(article => {
      let parsedIntro: SafeHtml | null = null;
      if (article.intro) {
        const html = parseMarkdownIntro(article.intro);
        parsedIntro = this.#sanitizer.bypassSecurityTrustHtml(html);
      }
      return {
        ...article,
        parsedIntro
      };
    });
  });

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.scrollToArticleListPosition();
  }

  viewArticleDetail(article: IArticleInfo) {
    this.#storageService.setSessionItem(ESessionStorageItems.articleYPosition, window.scrollY.toString());
    const encodedId = window.btoa(article.id.toString());
    const queryParams = { title: article.title };

    if (article.isAi) {
      this.#router.navigate(['/ai-view-article', encodedId], { queryParams });
      return;
    }

    if (this.$iptArticleList().isPrivateArticle) {
      this.#router.navigate(['/view-private-article', encodedId]);
      return;
    }
    this.#router.navigate(['/view-article', encodedId], { queryParams });
  }

  isCarouselEnabled(article: IArticleInfo): boolean {
    if (!article.extField1) return false;
    try {
      const parsed = JSON.parse(article.extField1) as ExtField1JSON;
      return !!parsed?.isCarouselEnabled;
    } catch (e) {
      return false;
    }
  }

  getCarouselInterval(article: IArticleInfo): number {
    return this.isCarouselEnabled(article) ? 3000 : 0;
  }

  isImage(fileType: string): boolean {
    return fileType.includes('image');
  }

  isVideo(fileType: string): boolean {
    return fileType.includes('video');
  }



  private scrollToArticleListPosition() {
    const lastYPosition = this.#storageService.getSessionItem(ESessionStorageItems.articleYPosition);
    if (lastYPosition) {
      setTimeout(() => {
        this.#scrollService.scrollToYPosition(Number(lastYPosition));
        this.#storageService.removeSessionItem(ESessionStorageItems.articleYPosition);
      }, 100);
    }
  }
}

interface IIptArticleList {
  articleList: IArticleInfo[];
  articleIdMapFile: Map<number, IArticleFile[]>;
  isPrivateArticle?: boolean;
}
