import { ActivatedRoute, Router } from '@angular/router';
import { ApiArticleCategoriesService } from './../../../../shared/services/api/api-article-categories/api-article-categories.service';
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
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  #globalStore = inject(GlobalStore);
  $$articleCategories = signal<IArticleCategory[]>([]);
  $$articleTypes = signal<IArticleDetails['articleType'] | '...'>('...');
  $$categoryId = signal<string>('');
  $isLoggedIn = this.#globalStore.isLoggedIn;
  $isAdmin = this.#globalStore.isAdmin;
  ArticleTypePublic = ArticleTypePublic;
  ArticleTypePrivate = ArticleTypePrivate;
  isFilterExpanded = signal(false);

  constructor() {
    this.#route.queryParamMap.subscribe(queryParam => {
      const articleType = queryParam.get('articleType') as IArticleDetails['articleType'] | null;
      this.$$articleTypes.set(articleType || ArticleTypePublic);
      this.$$categoryId.set(queryParam.get('categoryId') || '');
    });

    this.#apiArticleCategoriesService.getAllArticleCategories().subscribe({
      next: res => {
        this.$$articleCategories.set(res || []);
      },
      error: err => {
        console.error(err);
      },
    });
  }

  toggleFilter(): void {
    this.isFilterExpanded.set(!this.isFilterExpanded());
  }

  toggleCategory(categoryId: string): void {
    const queryParams = categoryId ? { categoryId } : {};

    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams,
      queryParamsHandling: 'replace',
    });
  }

  toggleArticleType(): void {
    const queryParams = this.$$articleTypes() === ArticleTypePublic ? { articleType: ArticleTypePrivate } : {};

    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams,
      queryParamsHandling: 'replace',
    });
  }

  goAdminPage(): void {
    this.#router.navigate(['manage']);
  }
}
