import { AfterViewInit, Component, inject, input, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesPipe } from '../../../../shared/filters/categories.pipe';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { IArticleFile, IArticleInfo, ExtField1JSON } from '../../../../shared/models/article.models';
import { ESessionStorageItems, StorageService } from '../../../../shared/services/storage.service';
import { ScrollService } from '../../../../shared/services/scroll.service';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';

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

  $iptArticleList = input.required<IIptArticleList>({ alias: 'iptArticleList' });

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
