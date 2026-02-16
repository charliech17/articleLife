import { ArticleTypePrivate, ArticleTypePublic } from './../../shared/models/article.models';
import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { TextareaComponent } from '../../shared/edit-components/textarea/textarea.component';
import { EditorComponent } from '../../shared/edit-components/editor/editor.component';
import { EditTitleComponent } from '../../shared/edit-components/edit-title/edit-title.component';
import { ActionSectionComponent } from '../../shared/edit-components/action-section/action-section.component';
import { ApiArticleService } from '../../shared/services/api/api-article/api-article.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IArticleDetails } from '../../shared/models/article.models';
import { MatDialog } from '@angular/material/dialog';
import {
  ArticleMetaDataSettingDialogComponent,
  IArticleCategory,
  IConfirmCategories,
} from './components/article-meta-data-setting-dialog/article-meta-data-setting-dialog.component';
import { ApiArticleCategoriesService } from '../../shared/services/api/api-article-categories/api-article-categories.service';
import { of, switchMap, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalStore } from '../../shared/stores/global.store';
import { EditorUploadImpl } from '../../shared/edit-components/editor/editor-upload-impl';
import { EnvService } from '../../shared/services/env.service';

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
  #globalStore = inject(GlobalStore);
  #envService = inject(EnvService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #matDialog = inject(MatDialog);
  #snackBar = inject(MatSnackBar);

  $$currentArticleDetails = signal<IArticleDetails>({
    id: -1,
    title: '',
    intro: '',
    articleContent: '',
    authorId: '',
    categories: '',
    lastModifyTime: '',
    createdTime: '',
    viewTimes: 0,
    articleType: ArticleTypePublic,
  });

  $$allCategories = signal<IArticleCategory[]>([]);
  $$currSelectedCategories = signal<IArticleCategory[]>([]);
  $isEditArticle = signal<boolean>(false);
  isLoading = true;
  editorUploadImplInstance: EditorUploadImpl | null = null;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (this.$isEditArticle()) {
        this.saveArticle();
      } else {
        this.submitArticle();
      }
    }
  }

  constructor() {
    this.watchCanInitPage();
  }

  private watchCanInitPage(): void {
    const effectRef = effect(
      () => {
        if (this.#globalStore.hasStoreFinishedInit()) {
          this.initPage();
          effectRef.destroy(); // only run once
        }
      },
      { manualCleanup: true },
    );
  }

  private initPage(): void {
    this.#route.paramMap.subscribe(params => {
      const articleId = params.get('id');
      this.checkIsValidAuthor(articleId ?? '').subscribe({
        next: _res => {
          this.goAddOrEditArticle(articleId);
        },
        error: err => {
          console.error('You cannot edit the article', err);
          this.#router.navigate([`/view-article/${articleId}`]);
        },
      });
    });
  }

  private checkIsValidAuthor(articleId: string) {
    const userId = this.#globalStore.userInfo().loginId ?? '';
    if (!userId) {
      return throwError(() => new Error('User is not logged in'));
    }

    if (!articleId) {
      return of(true);
    }

    return this.#apiArticleService.checkCanEditArticle(articleId, userId);
  }

  private goAddOrEditArticle(articleId: string | null): void {
    if (articleId) {
      this.$isEditArticle.set(true);
      this.apiLoadArticle(articleId);
    } else {
      this.isLoading = false;
      this.apiGetAllCategories(null);
      this.setAuthorId();
    }
  }

  private apiLoadArticle(id: string): void {
    this.#apiArticleService.getEditArticle(id).subscribe({
      next: (res: IArticleDetails) => {
        this.$$currentArticleDetails.update(prev => ({ ...prev, ...res }));
        this.isLoading = false;
        this.apiGetAllCategories(res);

        this.editorUploadImplInstance = new EditorUploadImpl(
          res.id.toString(),
          this.#envService.baseApiUrl,
          this.uploadSuccessCallback.bind(this),
        );
      },
      error: err => {
        console.error('Failed to fetch article', err);
      },
    });
  }

  private uploadSuccessCallback(): void {
    console.log('File uploaded successfully');
    this.saveArticle();
  }

  private apiGetAllCategories(articleDetailRes: IArticleDetails | null): void {
    this.#apiArticleCategoriesService.getAllArticleCategories().subscribe(categoriesRes => {
      this.$$allCategories.set(categoriesRes || []);

      if (!articleDetailRes) return;
      this.$$currSelectedCategories.set((categoriesRes || []).filter(c => (articleDetailRes.categories ?? '').includes(c.categoryName)));
    });
  }

  private setAuthorId(): void {
    const authorLoginId = this.#globalStore.userInfo().loginId ?? '';
    this.$$currentArticleDetails.update(prev => ({ ...prev, authorId: authorLoginId }));
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
        this.#snackBar.open(`Article saved successfully at ${new Date().toString()}`, 'Close', { duration: 2500 });
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
        allArticleTypes: [ArticleTypePublic, ArticleTypePrivate],
        selectedArticleType: this.$$currentArticleDetails().articleType,
      },
    });

    dialogRef.afterClosed().subscribe((categories: IConfirmCategories) => {
      if (!categories.selectedCategories.length) {
        alert('selected categories is null, cannot proceed');
        return;
      }

      this.$$currSelectedCategories.set(categories.selectedCategories);
      this.$$currentArticleDetails.update(prev => ({ ...prev, articleType: categories.selectedArticleType }));
      this.updateMetaDataOrCreateArticle(categories);
      this.saveArticle();
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
