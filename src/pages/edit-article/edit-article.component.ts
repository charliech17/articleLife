import { Component, inject, signal } from '@angular/core';
import { TextareaComponent } from '../../shared/edit-components/textarea/textarea.component';
import { EditorComponent } from '../../shared/edit-components/editor/editor.component';
import { EditTitleComponent } from '../../shared/edit-components/edit-title/edit-title.component';
import { ActionSectionComponent } from '../../shared/edit-components/action-section/action-section.component';
import { ApiArticleService } from '../../shared/services/api/api-article/api-article.service';
import { ActivatedRoute } from '@angular/router';
import { IArticleDetailsResponse } from '../../shared/models/article.models';

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [TextareaComponent, EditorComponent, EditTitleComponent, ActionSectionComponent],
  templateUrl: './edit-article.component.html',
  styleUrl: './edit-article.component.scss',
})
export class EditArticleComponent {
  #apiArticleService = inject(ApiArticleService);
  #route = inject(ActivatedRoute);

  $$currentArticleDetails = signal<IArticleDetails>({ id: -1, title: '', intro: '', articleContent: '', authorId: 'josh' });
  isLoading = true;

  constructor() {
    this.initPage();
  }

  initPage(): void {
    this.#route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.apiLoadArticle(id);
      } else {
        this.isLoading = false;
      }
    });
  }

  apiLoadArticle(id: string): void {
    this.#apiArticleService.getArticle(id).subscribe({
      next: (res: IArticleDetailsResponse) => {
        this.$$currentArticleDetails.update(prev => ({ ...prev, ...res }));
        this.isLoading = false;
      },
      error: err => {
        console.error('Failed to fetch article', err);
      },
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
    this.#apiArticleService.createArticle(this.$$currentArticleDetails()).subscribe({
      next: (res: any) => {
        console.log('Article created successfully');
      },
      error: err => {
        console.error('Failed to create article', err);
      },
    });
  }
}

interface IArticleDetails {
  id: number;
  title: string;
  intro: string;
  articleContent: string;
  authorId: string;
}
