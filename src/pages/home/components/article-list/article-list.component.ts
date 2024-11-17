import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesPipe } from '../../../../shared/filters/categories.pipe';
import { DatePipe } from '@angular/common';
import { IArticleDetails } from '../../../edit-article/edit-article.component';

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

  viewArticleDetail(articleId: string | number) {
    this.#router.navigate(['/view-article', articleId]);
  }
}

interface IIptArticleList {
  articleList: IArticleDetails[];
}
