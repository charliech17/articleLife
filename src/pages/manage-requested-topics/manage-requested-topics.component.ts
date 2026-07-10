import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ApiAiArticleService, AiArticleCategoryAdmin } from '../../shared/services/api/api-ai-article/api-ai-article.service';

@Component({
  selector: 'app-manage-requested-topics',
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
  templateUrl: './manage-requested-topics.component.html',
  styleUrls: ['./manage-requested-topics.component.scss']
})
export class ManageRequestedTopicsComponent implements OnInit {
  #apiService = inject(ApiAiArticleService);

  categories = signal<AiArticleCategoryAdmin[]>([]);
  displayedColumns: string[] = ['id', 'categoryName', 'requestedTopic', 'actions'];

  editingId: number | null = null;
  editingTopic: string = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.#apiService.getAdminCategories().subscribe({
      next: (data) => {
        this.categories.set(data || []);
      },
      error: (err) => {
        console.error('Failed to load admin categories', err);
      }
    });
  }

  startEdit(category: AiArticleCategoryAdmin): void {
    this.editingId = category.id;
    this.editingTopic = category.requestedTopic || '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingTopic = '';
  }

  saveTopic(id: number): void {
    this.#apiService.updateRequestedTopic(id, this.editingTopic).subscribe({
      next: () => {
        this.loadCategories();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Failed to update requested topic', err);
      }
    });
  }

  clearTopic(id: number): void {
    if (confirm('確定要清除今日主題嗎？ (Are you sure you want to clear the topic?)')) {
      this.#apiService.updateRequestedTopic(id, null).subscribe({
        next: () => {
          this.loadCategories();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Failed to clear requested topic', err);
        }
      });
    }
  }
}
