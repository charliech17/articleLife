import { Editor, FileLoader, UploadAdapter } from 'ckeditor5';
import { EditorUploadImpl } from './editor-upload-impl';

export function uploadAdapterPluginFactory(editor: Editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => {
    return new UploadAdapterImpl(loader, editor);
  };
}

class UploadAdapterImpl implements UploadAdapter {
  loader: any;
  xhr: XMLHttpRequest | null = null;
  editor: Editor;

  constructor(loader: FileLoader, editor: Editor) {
    // The file loader instance to use during the upload.
    this.loader = loader;
    this.editor = editor;
  }

  // Starts the upload process.
  upload() {
    return this.loader.file.then(
      (file: File) =>
        new Promise((resolve, reject) => {
          const xhr = (this.xhr = new XMLHttpRequest());
          const instance = this.editor.config.get('editorUploadImplInstance') as EditorUploadImpl;
          instance.setDataFromEditor(this.editor, file, resolve, reject, this.loader, xhr);
          instance.upload();
        }),
    );
  }

  // Aborts the upload process.
  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }
}
