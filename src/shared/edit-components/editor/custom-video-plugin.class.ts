import { ButtonView, Editor, Locale, Plugin } from 'ckeditor5';
import { AppUtil } from '../../utils/app.util';
import { API_CONSTANTS } from '../../../config/api.constants';

export class CustomVideoPlugin extends Plugin {
  init() {
    const editor = this.editor;
    this.addVideoUploadButton(editor);
  }

  private addVideoUploadButton(editor: Editor) {
    editor.ui.componentFactory.add('videoUpload', locale => {
      const view = this.setAndGetButtonView(locale);
      this.registerSchema(editor);
      this.registerUpcast(editor);
      this.registerDowncast(editor);
      this.listenToView(view, editor);

      return view;
    });
  }

  private setAndGetButtonView(locale: Locale) {
    const view = new ButtonView(locale);
    view.set({
      label: 'Upload Video',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM64 288c0-17.7 14.3-32 32-32l96 0c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32l0-96zM300.9 397.9L256 368l0-64 44.9-29.9c2-1.3 4.4-2.1 6.8-2.1c6.8 0 12.3 5.5 12.3 12.3l0 103.4c0 6.8-5.5 12.3-12.3 12.3c-2.4 0-4.8-.7-6.8-2.1z"/></svg>',
      tooltip: true,
    });

    return view;
  }

  private registerSchema(editor: Editor) {
    editor.model.schema.register('video', {
      isObject: true,
      allowWhere: '$block',
      allowAttributes: ['src', 'controls', 'videoClass'],
    });
  }

  private registerUpcast(editor: Editor) {
    editor.conversion.for('upcast').elementToElement({
      view: {
        name: 'video',
        attributes: {
          src: true,
          class: true,
        },
      },
      model: (viewElement, { writer }) => {
        return writer.createElement('video', {
          src: viewElement.getAttribute('src'),
          controls: viewElement.getAttribute('controls'),
          videoClass: viewElement.getAttribute('class'),
        });
      },
    });
  }

  private registerDowncast(editor: Editor) {
    editor.conversion.for('downcast').elementToElement({
      model: 'video',
      view: (modelElement, { writer }) => {
        const videoElement = writer.createContainerElement('video', {
          src: modelElement.getAttribute('src'),
          class: modelElement.getAttribute('videoClass') ? modelElement.getAttribute('videoClass') : null,
          controls: modelElement.getAttribute('controls') ? 'controls' : null,
        });
        return writer.createContainerElement('div', { class: 'al-ckeditor-video-container' }, videoElement);
      },
    });
  }

  private listenToView(view: ButtonView, editor: Editor) {
    view.on('execute', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'video/*';
      fileInput.click();

      fileInput.onchange = () => {
        const file = fileInput.files?.[0];
        if (!file) {
          throw new Error('No file selected');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('articleId', editor.config.get('articleId') as string);
        this.apiUploadVideo(editor, formData);
      };
    });
  }

  private apiUploadVideo(editor: Editor, formData: FormData) {
    fetch(`${editor.config.get('baseApiUrl')}/api/files/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        [API_CONSTANTS.X_XSRF_TOKEN]: AppUtil.getCookie(API_CONSTANTS.XSRF_TOKEN) || '',
      },
    })
      .then(response => response.json())
      .then(data => this.checkVideoLandScapeOrPortrait(data.fileUrl))
      .then((data: IAfterCheckVideoLandScapeOrPortrait) => this.insertVideoToEditor(editor, data))
      .catch(error => {
        console.error('Error:', error);
      });
  }

  private checkVideoLandScapeOrPortrait(videoUrl: string): Promise<IAfterCheckVideoLandScapeOrPortrait> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        const landScapeOrPortrait =
          video.videoWidth > video.videoHeight ? EVideoLandScapeOrPortrait.LANDSCAPE : EVideoLandScapeOrPortrait.PORTRAIT;
        resolve({ landScapeOrPortrait, videoUrl });
      });
    });
  }

  private insertVideoToEditor(editor: Editor, data: IAfterCheckVideoLandScapeOrPortrait) {
    editor.model.change(writer => {
      const insertPosition = editor.model.document.selection.getFirstPosition();
      const videoElement = writer.createElement('video', {
        src: data.videoUrl,
        controls: true,
        videoClass:
          data.landScapeOrPortrait === EVideoLandScapeOrPortrait.LANDSCAPE ? 'al-ckeditor-video-landscape' : 'al-ckeditor-video-portrait',
      });

      editor.model.insertContent(videoElement, insertPosition);
    });
  }
}

enum EVideoLandScapeOrPortrait {
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
  NONE = 'none',
}

interface IAfterCheckVideoLandScapeOrPortrait {
  landScapeOrPortrait: EVideoLandScapeOrPortrait;
  videoUrl: string;
}
