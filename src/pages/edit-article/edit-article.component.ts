import { Component, inject, signal } from '@angular/core';
import { TextareaComponent } from '../../shared/edit-components/textarea/textarea.component';
import { EditorComponent } from '../../shared/edit-components/editor/editor.component';
import { EditTitleComponent } from '../../shared/edit-components/edit-title/edit-title.component';
import { ActionSectionComponent } from '../../shared/edit-components/action-section/action-section.component';
import { ApiArticleService } from '../../shared/services/api/api-article/api-article.service';
import { testData } from './test';

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [TextareaComponent, EditorComponent, EditTitleComponent, ActionSectionComponent],
  templateUrl: './edit-article.component.html',
  styleUrl: './edit-article.component.scss',
})
export class EditArticleComponent {
  #apiArticleService = inject(ApiArticleService);

  currentArticleDetails = signal<IArticleDetails>({ ...testData });

  handleUpdateTitle(newTitle: string): void {
    this.currentArticleDetails.update(prev => ({ ...prev, title: newTitle }));
    console.log('currentArticleDetails', this.currentArticleDetails());
  }

  handleUpdateIntro(newText: string): void {
    this.currentArticleDetails.update(prev => ({ ...prev, intro: newText }));
    console.log('currentArticleDetails', this.currentArticleDetails());
  }

  handleUpdateEditor(newContent: string): void {
    this.currentArticleDetails.update(prev => ({ ...prev, articleContent: newContent }));
    console.log('currentArticleDetails', this.currentArticleDetails());
  }

  submitArticle(): void {
    this.#apiArticleService.createArticle(this.currentArticleDetails()).subscribe({
      next: (res: any) => {
        console.log(res);
        console.log('Article created successfully');
      },
      error: err => {
        console.error('Failed to create article', err);
      },
    });
  }
}

interface IArticleDetails {
  title: string;
  intro: string;
  articleContent: string;
  authorId: string;
}
