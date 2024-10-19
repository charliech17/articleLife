import { afterNextRender, ChangeDetectorRef, Component } from '@angular/core';
import { TranslateDirective } from '../../shared/language';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor } from 'ckeditor5';

@Component({
  selector: 'app-poc',
  standalone: true,
  imports: [TranslateDirective, CKEditorModule],
  templateUrl: './poc.component.html',
  styleUrl: './poc.component.scss',
})
export class PocComponent {
  editor: typeof ClassicEditor | null = null;
  config: typeof ClassicEditor.defaultConfig | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    afterNextRender(() => {
      this.loadCkEditor();
    });
  }

  async loadCkEditor() {
    const { Bold, Essentials, Italic, Mention, Paragraph, Undo, ClassicEditor, Heading } = await import('ckeditor5');
    this.config = {
      toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'Heading'],
      plugins: [Bold, Essentials, Italic, Mention, Paragraph, Undo, Heading],
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h2', title: '主要title', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h3', title: '次級title', class: 'ck-heading_heading2' },
        ],
      },
    };
    this.editor = ClassicEditor;
    this.cdr.detectChanges();
  }
}
