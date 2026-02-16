import { ArticleTypePrivate, ArticleTypePublic } from './../../../../shared/models/article.models';
import { Component, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IArticleDetails } from '../../../../shared/models/article.models';

@Component({
  selector: 'app-article-meta-data-setting-dialog',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './article-meta-data-setting-dialog.component.html',
  styleUrl: './article-meta-data-setting-dialog.component.scss',
})
export class ArticleMetaDataSettingDialogComponent {
  #dialogRef = inject(MatDialogRef<ArticleMetaDataSettingDialogComponent>);
  #dialogInput = inject<IDialogInput>(MAT_DIALOG_DATA);

  $$articleCategories = signal<IArticleCategory[]>([]);
  selectCategoryControl = new FormControl<IArticleCategory[]>([], { nonNullable: true });
  $$allArticleTypes = signal<string[]>([]);
  selectArticleTypeControl = new FormControl<IArticleDetails['articleType']>(this.#dialogInput.selectedArticleType, { nonNullable: true });

  ngOnInit(): void {
    this.$$articleCategories.set(this.#dialogInput.allCategories);
    this.selectCategoryControl.setValue(this.#dialogInput.selectedCategories);
    this.$$allArticleTypes.set(this.#dialogInput.allArticleTypes);
    this.selectArticleTypeControl.setValue(this.#dialogInput.selectedArticleType);
  }

  closeDialog(confirmData: IConfirmCategories | null): void {
    this.#dialogRef.close(confirmData);
  }

  initSelectedCategories(targetCategoriesName: string[]): void {
    const newSelectedCategories = this.$$articleCategories().filter(ac => targetCategoriesName.includes(ac.categoryName));
    this.selectCategoryControl.setValue(newSelectedCategories);
  }

  saveCategories(): void {
    this.closeDialog({ selectedCategories: this.selectCategoryControl.value, selectedArticleType: this.selectArticleTypeControl.value });
  }
}

export interface IArticleCategory {
  categoryId: string;
  categoryName: string;
}

export interface IConfirmCategories {
  selectedCategories: IArticleCategory[];
  selectedArticleType: IArticleDetails['articleType'];
}

export interface IDialogInput {
  articleDetails: IArticleDetails;
  allCategories: IArticleCategory[];
  selectedCategories: IArticleCategory[];
  allArticleTypes: [typeof ArticleTypePublic, typeof ArticleTypePrivate];
  selectedArticleType: IArticleDetails['articleType'];
}
