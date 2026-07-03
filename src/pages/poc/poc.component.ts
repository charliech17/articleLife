import { afterNextRender, ChangeDetectorRef, Component, inject } from '@angular/core';
import { TranslateDirective } from '../../shared/language';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor } from 'ckeditor5';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-poc',
  standalone: true,
  imports: [CKEditorModule],
  templateUrl: './poc.component.html',
  styleUrl: './poc.component.scss',
})
export class PocComponent {
  editor: typeof ClassicEditor | null = null;
  config: typeof ClassicEditor.defaultConfig | null = null;
  preparedFile: File | null = null;

  #http = inject(HttpClient);

  constructor(private cdr: ChangeDetectorRef) {
    afterNextRender(() => {
      this.loadCkEditor();
    });
  }

  async loadCkEditor() {
    const { Bold, Essentials, Italic, Mention, Paragraph, Undo, ClassicEditor, Heading } = await import('ckeditor5');
    this.config = {
      licenseKey: 'GPL',
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

  handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files) {
      return;
    }

    const file = files.item(0);
    if (file) {
      this.preparedFile = file;
    }
  }

  handleUpload() {
    if (this.preparedFile) {
      const formData = new FormData();
      formData.append('file', this.preparedFile);
      formData.append('articleId', '1');
      this.#http.post('api/files/upload', formData).subscribe(res => {
        console.log(res);
      });
    }
  }
}
