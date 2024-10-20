import { Component, input } from '@angular/core';
import { IArticleDetail } from '../../home.component';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
})
export class ArticleListComponent {
  $iptArticleList = input.required<IIptArticleList>({ alias: 'iptArticleList' });

  constructor() {}
}

interface IIptArticleList {
  articleList: IArticleDetail[];
}
