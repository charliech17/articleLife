import { AfterViewInit, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesPipe } from '../../../../shared/filters/categories.pipe';
import { DatePipe } from '@angular/common';
import { IArticleFile, IArticleInfo } from '../../../../shared/models/article.models';
import { ESessionStorageItems, StorageService } from '../../../../shared/services/storage.service';
import { ScrollService } from '../../../../shared/services/scroll.service';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CategoriesPipe, DatePipe],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
})
export class ArticleListComponent implements AfterViewInit {
  #router = inject(Router);
  #storageService = inject(StorageService);
  #scrollService = inject(ScrollService);

  $iptArticleList = input.required<IIptArticleList>({ alias: 'iptArticleList' });

  $randomArticleFilesIndex = computed(() => {
    const randomIndexMap = new Map<number, number>();
    this.$iptArticleList().articleIdMapFile.forEach((_, articleId) => {
      randomIndexMap.set(articleId, this.getRandomArticleMediaIndex(articleId));
    });

    return randomIndexMap;
  });

  ngAfterViewInit(): void {
    this.scrollToArticleListPosition();
  }

  viewArticleDetail(articleId: string | number) {
    this.#storageService.setSessionItem(ESessionStorageItems.articleYPosition, window.scrollY.toString());
    if (this.$iptArticleList().isPrivateArticle) {
      this.#router.navigate(['/view-private-article', articleId]);
      return;
    }
    this.#router.navigate(['/view-article', articleId]);
  }

  getRandomArticleMediaIndex(articleId: number) {
    const min = 1;
    const max = this.$iptArticleList().articleIdMapFile.get(articleId)?.length ?? 1;
    const randomIndex = Math.floor(Math.random() * (max - min) + min);
    return randomIndex - 1;
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
