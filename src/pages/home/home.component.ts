import { Component, inject, signal } from '@angular/core';
import { ApiArticleService } from '../../shared/services/api/api-article/api-article.service';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { IArticleDetails } from '../edit-article/edit-article.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ArticleListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  #apiArticleService = inject(ApiArticleService);

  $$allArticles = signal<IArticleDetails[]>([]);

  constructor() {
    this.#apiArticleService.getAllArticles().subscribe((res: IArticleDetails[]) => {
      // sort res by modified time
      this.sortByLastModifyTime(res);
      this.$$allArticles.set(res);
    });
  }

  private sortByLastModifyTime(source: IArticleDetails[]): void {
    source.sort((a, b) => {
      if (a.lastModifyTime && b.lastModifyTime) {
        return new Date(b.lastModifyTime).getTime() - new Date(a.lastModifyTime).getTime();
      }
      return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
    });
  }
}
