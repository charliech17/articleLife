import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesPipe } from '../../../../shared/filters/categories.pipe';
import { DatePipe } from '@angular/common';
import { IArticleDetails } from '../../../edit-article/edit-article.component';
import { IArticleFile } from '../../../../shared/models/article.models';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CategoriesPipe, DatePipe],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
})
export class ArticleListComponent {
  #router = inject(Router);

  $iptArticleList = input.required<IIptArticleList>({ alias: 'iptArticleList' });

  $randomArticleFilesIndex = computed(() => {
    const randomIndexMap = new Map<number, number>();
    this.$iptArticleList().articleIdMapFile.forEach((_, articleId) => {
      randomIndexMap.set(articleId, this.getRandomArticleMediaIndex(articleId));
    });

    return randomIndexMap;
  });

  viewArticleDetail(articleId: string | number) {
    this.#router.navigate(['/view-article', articleId]);
  }

  getRandomArticleMediaIndex(articleId: number) {
    const min = 1;
    const max = this.$iptArticleList().articleIdMapFile.get(articleId)?.length ?? 1;
    const randomIndex = Math.floor(Math.random() * (max - min) + min);
    return randomIndex - 1;
  }
}

interface IIptArticleList {
  articleList: IArticleDetails[];
  articleIdMapFile: Map<number, IArticleFile[]>;
}
