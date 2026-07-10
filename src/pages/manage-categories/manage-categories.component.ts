import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ApiArticleCategoriesService } from '../../shared/services/api/api-article-categories/api-article-categories.service';
import { IArticleCategory, IArticleCategoryDTO } from '../../shared/models/article-category.models';

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule
  ],
  templateUrl: './manage-categories.component.html',
  styleUrls: ['./manage-categories.component.scss']
})
export class ManageCategoriesComponent implements OnInit {
  #apiCategory = inject(ApiArticleCategoriesService);

  categories = signal<IArticleCategory[]>([]);
  displayedColumns: string[] = ['categoryId', 'categoryName', 'description', 'order', 'actions'];

  currentCategory: IArticleCategoryDTO & { categoryId?: string } = {
    categoryName: '',
    description: '',
    order: 0
  };

  isEditing = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.#apiCategory.getAllArticleCategories().subscribe({
      next: (data) => {
        this.categories.set(data || []);
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        // Fallback for UI testing since API is not ready
        this.categories.set([
          { categoryId: '1', categoryName: '技術 (Tech)', description: '技術相關文章', order: 1 },
          { categoryId: '2', categoryName: '生活 (Life)', description: '生活點滴', order: 2 }
        ]);
      }
    });
  }

  onSubmit(): void {
    if (this.isEditing && this.currentCategory.categoryId) {
      this.#apiCategory.updateCategory(this.currentCategory.categoryId, this.currentCategory).subscribe({
        next: () => {
          this.loadCategories();
          this.resetForm();
        },
        error: (err) => {
          console.error('Failed to update category', err);
          // Mock behavior for UI testing
          const index = this.categories().findIndex(c => c.categoryId === this.currentCategory.categoryId);
          if (index !== -1) {
            const currentArray = [...this.categories()];
            currentArray[index] = { ...this.currentCategory } as IArticleCategory;
            this.categories.set(currentArray); // trigger change detection
          }
          this.resetForm();
        }
      });
    } else {
      this.#apiCategory.createCategory(this.currentCategory).subscribe({
        next: () => {
          this.loadCategories();
          this.resetForm();
        },
        error: (err) => {
          console.error('Failed to create category', err);
          // Mock behavior for UI testing
          this.categories.set([...this.categories(), { ...this.currentCategory, categoryId: Math.random().toString(36).substring(7) } as IArticleCategory]);
          this.resetForm();
        }
      });
    }
  }

  editCategory(category: IArticleCategory): void {
    this.isEditing = true;
    this.currentCategory = { ...category };
  }

  deleteCategory(id: string): void {
    if (confirm('確定要刪除這個分類嗎？ (Are you sure?)')) {
      this.#apiCategory.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          console.error('Failed to delete category', err);
          // Mock behavior for UI testing
          this.categories.set(this.categories().filter(c => c.categoryId !== id));
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentCategory = {
      categoryName: '',
      description: '',
      order: 0
    };
  }
}
