import { ActivatedRoute, Router } from '@angular/router';
import { ApiArticleCategoriesService } from './../../../../shared/services/api/api-article-categories/api-article-categories.service';
import { ApiAiArticleService } from '../../../../shared/services/api/api-ai-article/api-ai-article.service';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { GlobalStore } from '../../../../shared/stores/global.store';
import { ArticleTypePrivate, ArticleTypePublic, IArticleDetails } from '../../../../shared/models/article.models';
import { IArticleCategory } from '../../../../shared/models/article-category.models';

@Component({
  selector: 'app-article-filter',
  imports: [MatButtonModule],
  standalone: true,
  templateUrl: './article-filter.component.html',
  styleUrl: './article-filter.component.scss',
})
export class ArticleFilterComponent {
  #apiArticleCategoriesService = inject(ApiArticleCategoriesService);
  #apiAiArticleService = inject(ApiAiArticleService);
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  #globalStore = inject(GlobalStore);
  $$articleCategories = signal<IArticleCategory[]>([]);
  $$articleTypes = signal<IArticleDetails['articleType'] | '...' | 'AI'>('...');
  $$categoryId = signal<string>('');
  $isLoggedIn = this.#globalStore.isLoggedIn;
  $isAdmin = this.#globalStore.isAdmin;
  ArticleTypePublic = ArticleTypePublic;
  ArticleTypePrivate = ArticleTypePrivate;
  isFilterExpanded = signal(false);

  constructor() {
    this.#route.queryParamMap.subscribe(queryParam => {
      const articleType = queryParam.get('articleType') as IArticleDetails['articleType'] | 'AI' | null;
      this.$$articleTypes.set(articleType || ArticleTypePublic);
      this.$$categoryId.set(queryParam.get('categoryId') || '');

      this.fetchCategories();
    });
  }

  fetchCategories(): void {
    if (this.$$articleTypes() === 'AI') {
      this.#apiAiArticleService.getAiCategories().subscribe({
        next: res => {
          const mappedCategories: IArticleCategory[] = (res || []).map(cat => ({
            categoryId: cat.id.toString(),
            categoryName: cat.categoryName,
            categoryOrder: cat.categoryOrder,
            categoryImgUrl: '',
            categoryUrlId: ''
          }));
          this.$$articleCategories.set(mappedCategories);
        },
        error: err => {
          console.error(err);
        },
      });
    } else {
      this.#apiArticleCategoriesService.getAllArticleCategories().subscribe({
        next: res => {
          this.$$articleCategories.set(res || []);
        },
        error: err => {
          console.error(err);
        },
      });
    }
  }

  toggleFilter(): void {
    this.isFilterExpanded.set(!this.isFilterExpanded());
  }

  toggleCategory(categoryId: string): void {
    const queryParams: any = { page: 1 };
    queryParams.categoryId = categoryId ? categoryId : null;

    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  toggleArticleType(): void {
    const queryParams: any = this.$$articleTypes() !== ArticleTypePrivate ? { articleType: ArticleTypePrivate } : { articleType: null };

    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }


  goAdminPage(): void {
    this.#router.navigate(['manage']);
  }
}
