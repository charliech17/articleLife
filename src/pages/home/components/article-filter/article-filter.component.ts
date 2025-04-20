import { ActivatedRoute, Router } from '@angular/router';
import { IArticleCategory } from '../../../edit-article/components/article-meta-data-setting-dialog/article-meta-data-setting-dialog.component';
import { ApiArticleCategoriesService } from './../../../../shared/services/api/api-article-categories/api-article-categories.service';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

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
  $$articleCategories = signal<IArticleCategory[]>([]);

  constructor() {
    this.#apiArticleCategoriesService.getAllArticleCategories().subscribe({
      next: res => {
        this.$$articleCategories.set(res || []);
      },
      error: err => {
        console.error(err);
      },
    });
  }

  toggleCategory(categoryId: string): void {
    const queryParams = categoryId ? { categoryId } : {};

    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams,
      queryParamsHandling: 'replace',
    });
  }
}
