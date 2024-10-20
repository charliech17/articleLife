import { afterNextRender, ChangeDetectorRef, Component, output } from '@angular/core';
import { ChangeEvent, CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor } from 'ckeditor5';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CKEditorModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  optEditorChange = output<string>();

  editor: typeof ClassicEditor | null = null;
  config: typeof ClassicEditor.defaultConfig | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    afterNextRender(() => {
      this.loadCkEditor();
    });
  }

  async loadCkEditor() {
    const {
      Bold,
      Essentials,
      Italic,
      Mention,
      Paragraph,
      Undo,
      ClassicEditor,
      Heading,
      Image,
      ImageInsert,
      ImageResizeEditing,
      ImageResizeHandles,
    } = await import('ckeditor5');
    this.config = {
      toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'Heading'],
      plugins: [Bold, Essentials, Italic, Mention, Paragraph, Undo, Heading, Image, ImageInsert, ImageResizeEditing, ImageResizeHandles],
      placeholder: 'Type here...',
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

  onEditorChange({ editor }: ChangeEvent): void {
    const data = editor.getData();
    this.optEditorChange.emit(data);
  }
}
