import { Component, inject, signal } from '@angular/core';
import { ApiArticleService } from '../../shared/services/api/api-article/api-article.service';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ApiArticleFilesService } from '../../shared/services/api/api-article-files/api-article-files.service';
import { IArticleFile, IArticleInfo } from '../../shared/models/article.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ArticleListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  #apiArticleService = inject(ApiArticleService);
  #apiArticleFilesService = inject(ApiArticleFilesService);

  $$allArticles = signal<IArticleInfo[]>([]);
  $$allArticleFiles = signal<IArticleFile[]>([]);
  articleIdMapFile: Map<number, IArticleFile[]> = new Map();

  constructor() {
    this.#apiArticleService.getAllArticleInfo().subscribe((res: IArticleInfo[]) => {
      // sort res by modified time
      this.sortByLastModifyTime(res);
      this.$$allArticles.set(res);
    });

    this.#apiArticleFilesService.getAllArticleFiles().subscribe(res => {
      this.$$allArticleFiles.set(res);
      res.forEach(file => {
        if (this.articleIdMapFile.has(file.articleId)) {
          this.articleIdMapFile.get(file.articleId)!.push(file);
        } else {
          this.articleIdMapFile.set(file.articleId, [file]);
        }
      });
    });
  }

  private sortByLastModifyTime(source: IArticleInfo[]): void {
    source.sort((a, b) => {
      if (a.lastModifyTime && b.lastModifyTime) {
        return new Date(b.lastModifyTime).getTime() - new Date(a.lastModifyTime).getTime();
      }
      return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
    });
  }
}
