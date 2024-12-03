import { afterNextRender, ChangeDetectorRef, Component, inject, input, output } from '@angular/core';
import { ChangeEvent, CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor } from 'ckeditor5';
import { uploadAdapterPluginFactory } from './editor-upload.adapter';
import { EnvService } from '../../services/env.service';
// import { initializeEditor } from './editor-plugins';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CKEditorModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  $inputEditor = input.required<IEditorInput>({ alias: 'inputEditor' });
  #envService = inject(EnvService);
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
      CodeBlock,
      Code,
      List,
      Autoformat,
    } = await import('ckeditor5');
    const { CustomVideoPlugin } = await import('./custom-video-plugin.class');

    this.config = {
      toolbar: [
        'undo',
        'redo',
        '|',
        'bold',
        'italic',
        'Heading',
        'insertImage',
        'codeBlock',
        'videoUpload',
        'bulletedList',
        'numberedList',
        'code',
      ],
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
        CodeBlock,
        Code,
        List,
        Autoformat,
        uploadAdapterPluginFactory,
        CustomVideoPlugin,
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
      list: {
        properties: {
          styles: true,
          startIndex: true,
          reversed: true,
        },
      },
      articleId: this.$inputEditor().uploadId,
      baseApiUrl: this.#envService.baseApiUrl,
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
  baseApiUrl: string;
}
