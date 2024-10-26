import { afterNextRender, ChangeDetectorRef, Component, input, output } from '@angular/core';
import { ChangeEvent, CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor } from 'ckeditor5';
import { uploadAdapterPluginFactory } from './editor-upload.adapter';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CKEditorModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  $inputEditor = input.required<IEditorInput>({ alias: 'inputEditor' });
  optEditorChange = output<string>();

  editor: typeof ClassicEditor | null = null;
  config: IEditorConfig | null = null;

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
      toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'Heading', 'insertImage'],
      plugins: [
        Bold,
        Essentials,
        Italic,
        Mention,
        Paragraph,
        Undo,
        Heading,
        Image,
        ImageInsert,
        ImageResizeEditing,
        ImageResizeHandles,
        uploadAdapterPluginFactory,
      ],
      placeholder: 'Type here...',
      initialData: this.$inputEditor().initContent,
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h2', title: '主要title', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h3', title: '次級title', class: 'ck-heading_heading2' },
        ],
      },
      articleId: this.$inputEditor().uploadId,
    };
    this.editor = ClassicEditor;
    this.cdr.detectChanges();
  }

  onEditorChange({ editor }: ChangeEvent): void {
    const data = editor.getData();
    this.optEditorChange.emit(data);
  }
}

interface IEditorInput {
  initContent: string;
  uploadId: number;
}

type IEditorConfig = typeof ClassicEditor.defaultConfig & ICustomEditorConfig;

export interface ICustomEditorConfig {
  articleId: number;
}
