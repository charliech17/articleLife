import { Component, inject, signal } from '@angular/core';
import { ApiArticleService } from '../../shared/services/api/api-article/api-article.service';
import { ArticleListComponent } from './components/article-list/article-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ArticleListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  #apiArticleService = inject(ApiArticleService);

  $$allArticles = signal<IArticleDetail[]>([]);

  constructor() {
    this.#apiArticleService.getAllArticles().subscribe((res: IArticleDetail[]) => {
      // sort res by modified time
      this.sortByLastModifyTime(res);
      this.$$allArticles.set(res);
    });
  }

  private sortByLastModifyTime(source: IArticleDetail[]): void {
    source.sort((a, b) => {
      if (a.lastModifyTime && b.lastModifyTime) {
        return new Date(b.lastModifyTime).getTime() - new Date(a.lastModifyTime).getTime();
      }
      return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
    });
  }
}

export interface IArticleDetail {
  id: number;
  title: string;
  intro: string;
  articleContent: string;
  createdTime: string;
  lastModifyTime: string | null;
  viewTimes: number;
}
