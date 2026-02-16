import { Editor, FileLoader } from 'ckeditor5';
import { AppUtil } from '../../utils/app.util';
import { API_CONSTANTS } from '../../../config/api.constants';

export class EditorUploadImpl {
  xhr: XMLHttpRequest | null = null;
  file: File | null = null;
  editor: Editor | null = null;
  resolve: (value: unknown) => void = () => {};
  reject: (reason?: any) => void = () => {};
  loader: FileLoader | null = null;

  articleId: string;
  baseApiUrl: string = '';
  uploadSuccessCallback?: Function;

  constructor(articleId: string, baseApiUrl: string, uploadSuccessCallback?: Function) {
    this.articleId = articleId;
    this.baseApiUrl = baseApiUrl;
    this.uploadSuccessCallback = uploadSuccessCallback;
  }

  setDataFromEditor(
    editor: Editor,
    file: File,
    resolve: (value: unknown) => void,
    reject: (reason?: any) => void,
    loader: FileLoader,
    xhr: XMLHttpRequest,
  ) {
    this.editor = editor;
    this.file = file;
    this.resolve = resolve;
    this.reject = reject;
    this.loader = loader;
    this.xhr = xhr;
  }

  upload() {
    const processedFile = this._doProcessFile(this.file!);
    this._initRequest();
    this._initListeners(this.loader, this.resolve, this.reject, processedFile);
    this._sendRequest(processedFile);
  }

  _initRequest() {
    const xhr = this.xhr!;
    xhr.open('POST', `${this.baseApiUrl}/api/files/upload`, true);
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    const xsrfToken = AppUtil.getCookie(API_CONSTANTS.XSRF_TOKEN);
    if (xsrfToken) {
      // 設置到 header 中
      xhr.setRequestHeader(API_CONSTANTS.X_XSRF_TOKEN, xsrfToken);
    }
  }

  _initListeners(loader: any, resolve: (value: unknown) => void, reject: (reason?: any) => void, file: File) {
    if (!this.xhr) {
      throw new Error('No xhr, please call _initRequest() first');
    }

    const xhr = this.xhr;
    const genericErrorText = `Couldn't upload file: ${file.name}.`;

    xhr.addEventListener('error', () => reject(genericErrorText));
    xhr.addEventListener('abort', () => reject());
    xhr.addEventListener('load', () => {
      const response = xhr.response;

      // This example assumes the XHR server's "response" object will come with
      // an "error" which has its own "message" that can be passed to reject()
      // in the upload promise.
      //
      // Your integration may handle upload errors in a different way so make sure
      // it is done properly. The reject() function must be called when the upload fails.
      if (!response || response.error) {
        return reject(response && response.error ? response.error.message : genericErrorText);
      }

      // If the upload is successful, resolve the upload promise with an object containing
      // at least the "default" URL, pointing to the image on the server.
      // This URL will be used to display the image in the content. Learn more in the
      // UploadAdapter#upload documentation.

      resolve({
        default: response.fileUrl,
      });

      setTimeout(() => {
        if (this.uploadSuccessCallback) {
          this.uploadSuccessCallback();
        }
      }, 500);
    });

    if (xhr.upload) {
      xhr.upload.addEventListener('progress', (evt: ProgressEvent) => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }

  _sendRequest(file: File) {
    const data = new FormData();
    data.append('file', file);
    data.append('articleId', this.articleId);

    if (!this.xhr) {
      throw new Error('No xhr, please call _initRequest() first');
    }

    // Send the request.
    this.xhr.send(data);
  }

  _doProcessFile(file: File) {
    const dateStr = new Date().toISOString().replaceAll(':', '_').replaceAll('.', '_');
    const namedFile = new File([file], dateStr + '_' + file.name, {
      type: file.type,
    });
    return namedFile;
  }
}
