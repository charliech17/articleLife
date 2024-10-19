import { Component } from '@angular/core';
import { TextareaComponent } from '../../shared/edit-components/textarea/textarea.component';
import { EditorComponent } from '../../shared/edit-components/editor/editor.component';

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [TextareaComponent, EditorComponent],
  templateUrl: './edit-article.component.html',
  styleUrl: './edit-article.component.scss',
})
export class EditArticleComponent {
  handleUpdateTitle(newText: string): void {
    console.log(newText);
  }

  handleUpdateIntro(newText: string): void {
    console.log(newText);
  }
}
