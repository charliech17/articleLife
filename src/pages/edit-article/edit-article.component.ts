import { Component, inject, signal } from '@angular/core';
import { TextareaComponent } from '../../shared/edit-components/textarea/textarea.component';
import { EditorComponent } from '../../shared/edit-components/editor/editor.component';
import { EditTitleComponent } from '../../shared/edit-components/edit-title/edit-title.component';
import { ActionSectionComponent } from '../../shared/edit-components/action-section/action-section.component';
import { ApiArticleService } from '../../shared/services/api/api-article/api-article.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IArticleDetailsResponse } from '../../shared/models/article.models';
import { MatDialog } from '@angular/material/dialog';
import {
  ArticleMetaDataSettingDialogComponent,
  IArticleCategory,
  IConfirmCategories,
} from './components/article-meta-data-setting-dialog/article-meta-data-setting-dialog.component';
import { ApiArticleCategoriesService } from '../../shared/services/api/api-article-categories/api-article-categories.service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [TextareaComponent, EditorComponent, EditTitleComponent, ActionSectionComponent],
  templateUrl: './edit-article.component.html',
  styleUrl: './edit-article.component.scss',
})
export class EditArticleComponent {
  #apiArticleService = inject(ApiArticleService);
  #apiArticleCategoriesService = inject(ApiArticleCategoriesService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #matDialog = inject(MatDialog);

  $$currentArticleDetails = signal<IArticleDetails>({
    id: -1,
    title: '',
    intro: '',
    articleContent: '',
    authorId: 'josh',
    categories: '',
    lastModifyTime: '',
    createdTime: '',
  });

  $$allCategories = signal<IArticleCategory[]>([]);
  $$currSelectedCategories = signal<IArticleCategory[]>([]);
  $isEditArticle = signal<boolean>(false);
  isLoading = true;

  constructor() {
    this.initPage();
  }

  initPage(): void {
    this.#route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.$isEditArticle.set(true);
        this.apiLoadArticle(id);
      } else {
        this.isLoading = false;
        this.apiGetAllCategories(null);
      }
    });
  }

  apiLoadArticle(id: string): void {
    this.#apiArticleService.getArticle(id).subscribe({
      next: (res: IArticleDetailsResponse) => {
        this.$$currentArticleDetails.update(prev => ({ ...prev, ...res }));
        this.isLoading = false;
        this.apiGetAllCategories(res);
      },
      error: err => {
        console.error('Failed to fetch article', err);
      },
    });
  }

  apiGetAllCategories(articleDetailRes: IArticleDetailsResponse | null): void {
    this.#apiArticleCategoriesService.getAllArticleCategories().subscribe(categoriesRes => {
      this.$$allCategories.set(categoriesRes || []);

      if (!articleDetailRes) return;
      this.$$currSelectedCategories.set((categoriesRes || []).filter(c => (articleDetailRes.categories ?? '').includes(c.categoryName)));
    });
  }

  handleUpdateTitle(newTitle: string): void {
    this.$$currentArticleDetails.update(prev => ({ ...prev, title: newTitle }));
  }

  handleUpdateIntro(newText: string): void {
    this.$$currentArticleDetails.update(prev => ({ ...prev, intro: newText }));
  }

  handleUpdateEditor(newContent: string): void {
    this.$$currentArticleDetails.update(prev => ({ ...prev, articleContent: newContent }));
  }

  saveArticle(): void {
    this.#apiArticleService.updateArticle(this.$$currentArticleDetails()).subscribe({
      next: (res: any) => {
        console.log('Article updated successfully');
      },
      error: err => {
        console.error('Failed to update article', err);
      },
    });
  }

  submitArticle(): void {
    this.openArticleMetaDataDialog();
  }

  editCategories(): void {
    this.openArticleMetaDataDialog();
  }

  private openArticleMetaDataDialog(): void {
    const dialogRef = this.#matDialog.open(ArticleMetaDataSettingDialogComponent, {
      data: {
        articleDetails: this.$$currentArticleDetails(),
        allCategories: this.$$allCategories(),
        selectedCategories: this.$$currSelectedCategories(),
      },
    });

    dialogRef.afterClosed().subscribe((categories: IConfirmCategories) => {
      if (!categories) return;

      this.$$currSelectedCategories.set(categories.selectedCategories);
      this.updateMetaDataOrCreateArticle(categories);
    });
  }

  private updateMetaDataOrCreateArticle(categories: IConfirmCategories): void {
    if (this.$isEditArticle()) {
      this.updateCategories(categories);
    } else {
      this.createArticle();
    }
  }

  private createArticle(): void {
    this.apiCreateArticle();
  }

  private updateCategories(categories: IConfirmCategories): void {
    this.apiUpdateCategories(categories.selectedCategories);
  }

  private apiCreateArticle(): void {
    let articleId = -1;

    this.#apiArticleService
      .createArticle(this.$$currentArticleDetails())
      .pipe(
        switchMap(res => {
          articleId = res.responseData.id;
          return this.#apiArticleCategoriesService.updateCategories({
            articleId,
            articleCategoriesInfo: this.$$currSelectedCategories(),
            articleCategoriesJSON: JSON.stringify(this.$$currSelectedCategories().map(c => c.categoryName)),
          });
        }),
      )
      .subscribe({
        next: res => {
          console.log('Article created successfully', res);
          this.#router.navigate([`/edit-article/${articleId}`]);
        },
        error: err => {
          console.error('Failed to create article', err);
        },
      });
  }

  private apiUpdateCategories(articleCategoriesInfo: IArticleCategory[]) {
    this.#apiArticleCategoriesService
      .updateCategories({
        articleId: this.$$currentArticleDetails().id,
        articleCategoriesInfo: articleCategoriesInfo,
        articleCategoriesJSON: JSON.stringify(articleCategoriesInfo.map(c => c.categoryName)),
      })
      .subscribe({
        next: (res: string) => {
          console.log('Categories updated successfully');
        },
        error: err => {
          console.error('Failed to update categories', err);
        },
      });
  }
}

export interface IArticleDetails {
  id: number;
  title: string;
  intro: string;
  articleContent: string;
  authorId: string;
  categories: string | null;
  lastModifyTime: string | null;
  createdTime: string;
}
