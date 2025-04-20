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

  ngOnInit(): void {
    this.$$articleCategories.set(this.#dialogInput.allCategories);
    this.selectCategoryControl.setValue(this.#dialogInput.selectedCategories);
  }

  closeDialog(confirmData: IConfirmCategories | null): void {
    this.#dialogRef.close(confirmData);
  }

  initSelectedCategories(targetCategoriesName: string[]): void {
    const newSelectedCategories = this.$$articleCategories().filter(ac => targetCategoriesName.includes(ac.categoryName));
    this.selectCategoryControl.setValue(newSelectedCategories);
  }

  saveCategories(): void {
    this.closeDialog({ selectedCategories: this.selectCategoryControl.value });
  }
}

export interface IArticleCategory {
  categoryId: string;
  categoryName: string;
}

export interface IConfirmCategories {
  selectedCategories: IArticleCategory[];
}

export interface IDialogInput {
  articleDetails: IArticleDetails;
  allCategories: IArticleCategory[];
  selectedCategories: IArticleCategory[];
}
