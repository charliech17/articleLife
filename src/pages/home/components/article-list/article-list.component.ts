import { Component, inject, input } from '@angular/core';
import { IArticleDetail } from '../../home.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [],
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
  articleList: IArticleDetail[];
}
